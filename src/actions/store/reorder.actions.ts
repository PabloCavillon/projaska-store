"use server";

import { prisma } from "@/lib/prisma";
import { getStoreSession } from "@/lib/store-auth";
import { getStoreProduct } from "@/actions/store/products.actions";
import { getStoreKit } from "@/actions/store/kits.actions";
import type { CartItem } from "@/contexts/cart-context";

export type ReorderResult =
    | { items: CartItem[]; skipped: string[] }
    | { error: string };

/**
 * Arma de nuevo las líneas de un pedido propio con precio y stock de hoy.
 * shortcut: el pedido no guarda si se compró por caja, así que todo vuelve como unidades; guardar `unit` en StoreOrderItem si hace falta.
 */
export async function getReorderItems(code: string): Promise<ReorderResult> {
    const session = await getStoreSession();
    if (!session) return { error: "Ingresá para repetir un pedido." };

    const order = await prisma.storeOrder.findFirst({
        where: { code, storeCustomerId: session.id, deletedAt: null },
        select: { items: { select: { productId: true, kitId: true, quantity: true } } },
    });
    if (!order) return { error: "No encontramos ese pedido." };

    const items: CartItem[] = [];
    const skipped: string[] = [];

    await Promise.all(order.items.map(async (line) => {
        if (line.productId) {
            const p = await getStoreProduct(line.productId);
            if (!p || (p.stock === 0 && !p.isMadeToOrder)) {
                skipped.push(p?.name ?? "Un producto que ya no está en el catálogo");
                return;
            }
            const offer = p.offerUnit === "unit" && p.offerPriceUsd !== null;
            items.push({
                cartKey: `product:${p.id}:unit`,
                type: "product",
                id: p.id,
                name: p.name,
                sku: p.sku,
                priceUsd: offer ? p.offerPriceUsd! : p.priceUsd,
                imageUrl: p.imageUrl,
                quantity: p.isMadeToOrder ? line.quantity : Math.min(line.quantity, p.stock),
                unit: "unit",
                isOffer: offer,
                isMadeToOrder: p.isMadeToOrder,
            });
        } else if (line.kitId) {
            const k = await getStoreKit(line.kitId);
            if (!k) {
                skipped.push("Un kit que ya no está disponible");
                return;
            }
            items.push({
                cartKey: `kit:${k.id}`,
                type: "kit",
                id: k.id,
                name: k.name,
                sku: k.sku,
                priceUsd: k.priceUsd,
                imageUrl: k.imageUrl,
                quantity: line.quantity,
                unit: "unit",
                isOffer: false,
            });
        }
    }));

    return { items, skipped };
}
