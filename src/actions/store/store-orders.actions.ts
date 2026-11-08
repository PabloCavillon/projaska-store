"use server";

import { assertString } from "@/lib/validations/common";
import { requireRole } from "@/lib/require-role";
import { prisma } from "@/lib/prisma";
import { getPriceConfig } from "@/actions/config";
import { getStoreSession } from "@/lib/store-auth";
import { calcPriceArs, calcDiscount, priceOf, type SaleUnit } from "@/lib/price-utils";
import { checkoutItemsSchema } from "@/lib/validations/store-order";
import { customAlphabet } from "nanoid";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { auth } from "@/auth";
import { StoreOrderStatus } from "@/generated/prisma/enums";
import { sendPushToAdminsAndSellers } from "@/lib/web-push";

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890", 8);

export type CheckoutItem = {
    productId?: string;
    kitId?: string;
    quantity: number;
    unit?: "unit" | "box";
    unitsPerBox?: number;
};

export type CheckoutResult = { code: string } | { error: string };

/** Recursively collect all leaf product requirements for a kit */
async function getKitLeafProducts(kitId: string, qty: number): Promise<Map<string, number>> {
    const items = await prisma.kitItem.findMany({ where: { kitId } });
    const result = new Map<string, number>();
    for (const item of items) {
        const total = item.quantity * qty;
        if (item.productId) {
            result.set(item.productId, (result.get(item.productId) ?? 0) + total);
        } else if (item.childKitId) {
            const child = await getKitLeafProducts(item.childKitId, total);
            for (const [pid, pqty] of child) {
                result.set(pid, (result.get(pid) ?? 0) + pqty);
            }
        }
    }
    return result;
}

export async function createStoreOrder(rawItems: CheckoutItem[]): Promise<CheckoutResult> {
    const session = await getStoreSession();
    if (!session) return { error: "Debés iniciar sesión para hacer un pedido." };

    // Lo que llega del navegador no es confiable: cantidades enteras y positivas, producto o kit.
    const parsed = checkoutItemsSchema.safeParse(rawItems);
    if (!parsed.success) return { error: "El carrito tiene datos inválidos. Revisá las cantidades." };
    const items = parsed.data;
    if (!items.length) return { error: "El carrito está vacío." };

    const config = await getPriceConfig();
    if (!config) return { error: "Sin configuración de precios. Contactá al administrador." };

    const productItems = items.filter((i) => i.productId);
    const kitItems = items.filter((i) => i.kitId);

    // --- Validate & price products (precio, caja y oferta salen de la base, no del navegador) ---
    const products = productItems.length
        ? await prisma.product.findMany({
            where: { id: { in: productItems.map((i) => i.productId!) }, deletedAt: null },
            select: { id: true, price: true, unitsPerBox: true, offerDiscountPct: true, offerUnit: true },
        })
        : [];
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    // Unidad y caja del mismo producto se guardan como una sola línea en unidades (StoreOrderItem es único por producto)
    const productLines = new Map<string, { units: number; usd: number; ars: number }>();
    for (const item of productItems) {
        const p = productMap[item.productId!];
        if (!p) return { error: "Producto no encontrado." };
        const price = priceOf({
            priceUsd: Number(p.price),
            unitsPerBox: p.unitsPerBox,
            offerDiscountPct: p.offerDiscountPct !== null ? Number(p.offerDiscountPct) : null,
            offerUnit: (p.offerUnit as SaleUnit | null) ?? null,
        }, item.unit);
        if (!price) return { error: "Ese producto ya no se vende por caja. Cambialo a unidades en el carrito." };
        const line = productLines.get(p.id) ?? { units: 0, usd: 0, ars: 0 };
        line.units += price.units * item.quantity;
        line.usd += price.usd * item.quantity;
        line.ars += calcPriceArs(price.usd, config) * item.quantity;
        productLines.set(p.id, line);
    }

    // --- Validate & price kits ---
    const kits = kitItems.length
        ? await prisma.kit.findMany({
            where: { id: { in: kitItems.map((i) => i.kitId!) }, deletedAt: null, isActive: true },
            select: { id: true, price: true },
        })
        : [];
    const kitMap = Object.fromEntries(kits.map((k) => [k.id, k]));

    const kitLines = new Map<string, number>();
    for (const item of kitItems) {
        if (!kitMap[item.kitId!]) return { error: "Kit no encontrado." };
        kitLines.set(item.kitId!, (kitLines.get(item.kitId!) ?? 0) + item.quantity);
    }

    // --- Totals ---
    let subtotalUsd = 0;
    let subtotalArs = 0;
    for (const line of productLines.values()) {
        subtotalUsd += line.usd;
        subtotalArs += line.ars;
    }
    for (const [kitId, qty] of kitLines) {
        const priceUsd = Number(kitMap[kitId].price);
        subtotalUsd += priceUsd * qty;
        subtotalArs += calcPriceArs(priceUsd, config) * qty;
    }

    // --- Discount ---
    const storeCustomer = await prisma.storeCustomer.findUnique({
        where: { id: session.id, deletedAt: null },
        include: { customer: { select: { isGuild: true } } },
    });
    // La sesión es un JWT de 7 días: puede sobrevivir a la baja de la cuenta en otro dispositivo
    if (!storeCustomer) return { error: "Tu cuenta ya no está activa." };
    const isGuild = storeCustomer?.customer?.isGuild ?? false;
    const discount = calcDiscount(subtotalArs, config, isGuild);
    const discountApplied = discount.pct;
    const discountType = discount.type ?? "NONE";

    const code = `STR-${nanoid()}`;

    const order = await prisma.storeOrder.create({
        data: {
            code,
            storeCustomerId: session.id,
            dollarRateAtCreation: config.dollarRate,
            subtotalUsd,
            discountApplied,
            discountType,
            items: {
                create: [
                    // quantity siempre en unidades; unitPriceUsd = promedio por unidad (caja y oferta incluidas)
                    ...[...productLines].map(([productId, line]) => ({
                        productId,
                        quantity: line.units,
                        unitPriceUsd: line.usd / line.units,
                    })),
                    ...[...kitLines].map(([kitId, qty]) => ({
                        kitId,
                        quantity: qty,
                        unitPriceUsd: Number(kitMap[kitId].price),
                    })),
                ],
            },
        },
    });

    // after(): en Vercel la función puede cortarse al responder; esto garantiza que el aviso salga
    after(() =>
        sendPushToAdminsAndSellers({
            title: "Nuevo pedido en tienda",
            body: `${session.name} realizó el pedido ${code}`,
            url: `/admin/store-orders/${order.id}`,
        }).catch(() => {}),
    );

    revalidatePath("/orders");
    return { code };
}

export type SerializedStoreOrder = {
    id: string;
    code: string;
    status: string;
    subtotalUsd: number;
    discountApplied: number;
    discountType: string | null;
    dollarRateAtCreation: number;
    totalArs: number | null;
    notes: string | null;
    createdAt: string;
    items: {
        id: string;
        productId: string | null;
        productName: string | null;
        productSku: string | null;
        kitId: string | null;
        kitName: string | null;
        kitSku: string | null;
        quantity: number;
        unitPriceUsd: number;
    }[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeOrder(o: any): SerializedStoreOrder {
    return {
        id: o.id,
        code: o.code,
        status: o.status,
        subtotalUsd: Number(o.subtotalUsd),
        discountApplied: Number(o.discountApplied),
        discountType: o.discountType,
        dollarRateAtCreation: Number(o.dollarRateAtCreation),
        totalArs: o.totalArs !== null ? Number(o.totalArs) : null,
        notes: o.notes,
        createdAt: o.createdAt.toISOString(),
        items: o.items.map((i: any) => ({
            id: i.id,
            productId: i.productId,
            productName: i.product?.name ?? null,
            productSku: i.product?.sku ?? null,
            kitId: i.kitId,
            kitName: i.kit?.name ?? null,
            kitSku: i.kit?.sku ?? null,
            quantity: i.quantity,
            unitPriceUsd: Number(i.unitPriceUsd),
        })),
    };
}

const orderInclude = {
    items: {
        include: {
            product: { select: { name: true, sku: true } },
            kit: { select: { name: true, sku: true } },
        },
    },
} as const;

// ─── ADMIN ───────────────────────────────────────────────────────────────────

export type AdminStoreOrder = SerializedStoreOrder & { customerName: string };

export async function getAdminStoreOrders(): Promise<AdminStoreOrder[]> {
    const session = await auth();
    if (!session?.user?.id) throw new Error("No autorizado");

    const orders = await prisma.storeOrder.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: {
            storeCustomer: { select: { name: true } },
            items: {
                include: {
                    product: { select: { name: true, sku: true } },
                    kit: { select: { name: true, sku: true } },
                },
            },
        },
    });

    return orders.map((o) => ({ ...serializeOrder(o), customerName: o.storeCustomer.name }));
}

export async function getAdminStoreOrder(id: string): Promise<AdminStoreOrder | null> {
    id = assertString(id);
    const session = await auth();
    if (!session?.user?.id) throw new Error("No autorizado");

    const order = await prisma.storeOrder.findUnique({
        where: { id },
        include: {
            storeCustomer: { select: { name: true } },
            items: {
                include: {
                    product: { select: { name: true, sku: true } },
                    kit: { select: { name: true, sku: true } },
                },
            },
        },
    });
    if (!order) return null;
    return { ...serializeOrder(order), customerName: order.storeCustomer.name };
}

export async function updateStoreOrderStatusAdmin(id: string, status: StoreOrderStatus) {
    id = assertString(id);
    status = assertString(status) as typeof status;
    const session = await requireRole("ADMIN", "SELLER", "WAREHOUSE");

    const order = await prisma.storeOrder.findUnique({
        where: { id },
        include: {
            items: {
                include: { product: { select: { isMadeToOrder: true } } },
            },
        },
    });
    if (!order) throw new Error("Order not found");

    const isConfirming =
        status === StoreOrderStatus.CONFIRMED &&
        (order.status === StoreOrderStatus.PENDING || order.status === StoreOrderStatus.PAYMENT_REGISTERED);

    if (isConfirming) {
        await prisma.$transaction(async (tx) => {
            // Cambiar el estado primero y solo si sigue sin confirmar: un doble clic no descuenta dos veces
            const claimed = await tx.storeOrder.updateMany({
                where: { id, status: { in: [StoreOrderStatus.PENDING, StoreOrderStatus.PAYMENT_REGISTERED] } },
                data: { status },
            });
            if (claimed.count === 0) return;
            for (const item of order.items) {
                if (item.productId) {
                    // Productos por encargo no tienen stock real — no decrementar
                    if (item.product?.isMadeToOrder) continue;
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } },
                    });
                    await tx.stockMovement.create({
                        data: {
                            productId: item.productId,
                            userId: session.user!.id!,
                            type: "OUT",
                            quantity: item.quantity,
                            reason: "Venta Tienda",
                        },
                    });
                } else if (item.kitId) {
                    const leafProducts = await getKitLeafProducts(item.kitId, item.quantity);
                    for (const [productId, qty] of leafProducts) {
                        await tx.product.update({
                            where: { id: productId },
                            data: { stock: { decrement: qty } },
                        });
                        await tx.stockMovement.create({
                            data: {
                                productId,
                                userId: session.user!.id!,
                                type: "OUT",
                                quantity: qty,
                                reason: "Venta Tienda (Kit)",
                            },
                        });
                    }
                }
            }
        });
    } else {
        await prisma.storeOrder.update({ where: { id }, data: { status } });
    }

    revalidatePath("/orders");
}

// ─── CUSTOMER ─────────────────────────────────────────────────────────────────

export async function getMyStoreOrders(): Promise<SerializedStoreOrder[]> {
    const session = await getStoreSession();
    if (!session) return [];

    const orders = await prisma.storeOrder.findMany({
        where: { storeCustomerId: session.id, deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: orderInclude,
    });

    return orders.map(serializeOrder);
}

export async function getMyStoreOrder(code: string): Promise<SerializedStoreOrder | null> {
    code = assertString(code);
    const session = await getStoreSession();
    if (!session) return null;

    const order = await prisma.storeOrder.findFirst({
        where: { code, storeCustomerId: session.id, deletedAt: null },
        include: orderInclude,
    });

    if (!order) return null;
    return serializeOrder(order);
}
