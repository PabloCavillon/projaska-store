"use server";

import { prisma } from "@/lib/prisma";
import { getPriceConfig } from "@/actions/config";
import { getStoreSession } from "@/lib/store-auth";
import { calcPriceArs, calcDiscount } from "@/lib/price-utils";
import { customAlphabet } from "nanoid";
import { revalidatePath } from "next/cache";
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

export async function createStoreOrder(items: CheckoutItem[]): Promise<CheckoutResult> {
    const session = await getStoreSession();
    if (!session) return { error: "Debés iniciar sesión para hacer un pedido." };
    if (!items.length) return { error: "El carrito está vacío." };

    const config = await getPriceConfig();
    if (!config) return { error: "Sin configuración de precios. Contactá al administrador." };

    const productItems = items.filter((i) => i.productId);
    const kitItems = items.filter((i) => i.kitId);

    // --- Validate & price products ---
    const products = productItems.length
        ? await prisma.product.findMany({
            where: { id: { in: productItems.map((i) => i.productId!) }, deletedAt: null },
            select: { id: true, price: true, stock: true },
        })
        : [];
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    for (const item of productItems) {
        const p = productMap[item.productId!];
        if (!p) return { error: "Producto no encontrado." };
    }

    // --- Validate & price kits ---
    const kits = kitItems.length
        ? await prisma.kit.findMany({
            where: { id: { in: kitItems.map((i) => i.kitId!) }, deletedAt: null, isActive: true },
            select: { id: true, price: true },
        })
        : [];
    const kitMap = Object.fromEntries(kits.map((k) => [k.id, k]));

    for (const item of kitItems) {
        if (!kitMap[item.kitId!]) return { error: "Kit no encontrado." };
    }

    // --- Totals ---
    let subtotalUsd = 0;
    let subtotalArs = 0;

    for (const item of productItems) {
        const priceUsd = Number(productMap[item.productId!].price);
        subtotalUsd += priceUsd * item.quantity;
        subtotalArs += calcPriceArs(priceUsd, config) * item.quantity;
    }
    for (const item of kitItems) {
        const priceUsd = Number(kitMap[item.kitId!].price);
        subtotalUsd += priceUsd * item.quantity;
        subtotalArs += calcPriceArs(priceUsd, config) * item.quantity;
    }

    // --- Discount ---
    const storeCustomer = await prisma.storeCustomer.findUnique({
        where: { id: session.id },
        include: { customer: { select: { isGuild: true } } },
    });
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
                    ...productItems.map((item) => ({
                        productId: item.productId!,
                        quantity: item.quantity,
                        unitPriceUsd: Number(productMap[item.productId!].price),
                    })),
                    ...kitItems.map((item) => ({
                        kitId: item.kitId!,
                        quantity: item.quantity,
                        unitPriceUsd: Number(kitMap[item.kitId!].price),
                    })),
                ],
            },
        },
    });

    sendPushToAdminsAndSellers({
        title: "Nuevo pedido en tienda",
        body: `${session.name} realizó el pedido ${code}`,
        url: `/admin/store-orders/${order.id}`,
    }).catch(() => {});

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

export type AdminStoreOrder = {
    id: string;
    code: string;
    status: string;
    customerName: string;
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

    return orders.map((o) => ({
        id: o.id,
        code: o.code,
        status: o.status,
        customerName: o.storeCustomer.name,
        subtotalUsd: Number(o.subtotalUsd),
        discountApplied: Number(o.discountApplied),
        discountType: o.discountType,
        dollarRateAtCreation: Number(o.dollarRateAtCreation),
        totalArs: o.totalArs !== null ? Number(o.totalArs) : null,
        notes: o.notes,
        createdAt: o.createdAt.toISOString(),
        items: o.items.map((i) => ({
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
    }));
}

export async function getAdminStoreOrder(id: string): Promise<AdminStoreOrder | null> {
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
    return {
        id: order.id,
        code: order.code,
        status: order.status,
        customerName: order.storeCustomer.name,
        subtotalUsd: Number(order.subtotalUsd),
        discountApplied: Number(order.discountApplied),
        discountType: order.discountType,
        dollarRateAtCreation: Number(order.dollarRateAtCreation),
        totalArs: order.totalArs !== null ? Number(order.totalArs) : null,
        notes: order.notes,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map((i) => ({
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

export async function updateStoreOrderStatusAdmin(id: string, status: StoreOrderStatus) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

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
            await tx.storeOrder.update({ where: { id }, data: { status } });
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
    const session = await getStoreSession();
    if (!session) return null;

    const order = await prisma.storeOrder.findFirst({
        where: { code, storeCustomerId: session.id, deletedAt: null },
        include: orderInclude,
    });

    if (!order) return null;
    return serializeOrder(order);
}
