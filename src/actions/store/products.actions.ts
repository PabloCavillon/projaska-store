"use server";

import { prisma } from "@/lib/prisma";
import { getPriceConfig } from "@/actions/config";
import { calcPriceArs, priceOf, type PriceInfo, type SaleUnit } from "@/lib/price-utils";

export type StoreProduct = {
    id: string;
    sku: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    category: string;
    stock: number;
    priceUsd: number;
    priceArs: number;
    unitsPerBox: number | null;
    offerDiscountPct: number | null;
    offerPriceUsd: number | null;   // derived: priceUsd * (1 - offerDiscountPct/100)
    offerPriceArs: number | null;   // derived: calcPriceArs(offerPriceUsd)
    offerUnit: "unit" | "box" | null;
    isMadeToOrder: boolean;
};

const productSelect = {
    id: true, sku: true, name: true, description: true, imageUrl: true,
    category: true, stock: true, price: true,
    unitsPerBox: true, offerDiscountPct: true, offerUnit: true, isMadeToOrder: true,
} as const;

function mapProduct(p: {
    id: string; sku: string; name: string; description: string | null;
    imageUrl: string | null; category: string; stock: number;
    price: { toNumber(): number } | number | string;
    unitsPerBox: number | null;
    offerDiscountPct: { toNumber(): number } | number | string | null;
    offerUnit: string | null;
    isMadeToOrder: boolean;
}, priceInfo: PriceInfo): StoreProduct {
    const priceUsd = typeof p.price === "object" ? p.price.toNumber() : Number(p.price);
    const offerDiscountPct = p.offerDiscountPct !== null && p.offerDiscountPct !== undefined
        ? (typeof p.offerDiscountPct === "object" ? p.offerDiscountPct.toNumber() : Number(p.offerDiscountPct))
        : null;
    const offerUnit = (p.offerUnit as SaleUnit | null) ?? null;
    // Precio de la presentación en oferta (unidad o caja entera), con la misma regla que cobra el servidor
    const offerPriceUsd = offerDiscountPct !== null && offerUnit
        ? priceOf({ priceUsd, unitsPerBox: p.unitsPerBox, offerDiscountPct, offerUnit }, offerUnit)?.usd ?? null
        : null;
    return {
        id: p.id, sku: p.sku, name: p.name, description: p.description,
        imageUrl: p.imageUrl, category: p.category, stock: p.stock,
        priceUsd,
        priceArs: Math.round(calcPriceArs(priceUsd, priceInfo)),
        unitsPerBox: p.unitsPerBox,
        offerDiscountPct,
        offerPriceUsd,
        offerPriceArs: offerPriceUsd !== null ? Math.round(calcPriceArs(offerPriceUsd, priceInfo)) : null,
        offerUnit,
        isMadeToOrder: p.isMadeToOrder,
    };
}

export async function getStoreProduct(id: string): Promise<StoreProduct | null> {
    const [product, config] = await Promise.all([
        prisma.product.findUnique({ where: { id, deletedAt: null, showInStore: true }, select: productSelect }),
        getPriceConfig(),
    ]);
    if (!product || !config) return null;
    const priceInfo: PriceInfo = { dollarRate: config.dollarRate, shippingPct: config.shippingPct, profitPct: config.profitPct };
    return mapProduct(product, priceInfo);
}

export async function getStoreProducts(): Promise<{ products: StoreProduct[]; config: PriceInfo | null }> {
    const [products, config] = await Promise.all([
        prisma.product.findMany({
            where: { deletedAt: null, showInStore: true },
            orderBy: { name: "asc" },
            select: productSelect,
        }),
        getPriceConfig(),
    ]);

    if (!config) return { products: [], config: null };

    const priceInfo: PriceInfo = { dollarRate: config.dollarRate, shippingPct: config.shippingPct, profitPct: config.profitPct };
    return { products: products.map((p) => mapProduct(p, priceInfo)), config: priceInfo };
}

/** IDs de los productos más vendidos (pedidos manuales + tienda, sin cancelados), de mayor a menor. */
export async function getBestSellerIds(limit = 10): Promise<string[]> {
    const [manual, store] = await Promise.all([
        prisma.orderItem.groupBy({
            by: ["productId"],
            _sum: { quantity: true },
            where: { order: { status: { not: "CANCELLED" }, deletedAt: null } },
        }),
        prisma.storeOrderItem.groupBy({
            by: ["productId"],
            _sum: { quantity: true },
            where: { productId: { not: null }, storeOrder: { status: { not: "CANCELLED" }, deletedAt: null } },
        }),
    ]);
    const totals = new Map<string, number>();
    for (const row of [...manual, ...store]) {
        if (row.productId) totals.set(row.productId, (totals.get(row.productId) ?? 0) + (row._sum.quantity ?? 0));
    }
    return [...totals].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([id]) => id);
}
