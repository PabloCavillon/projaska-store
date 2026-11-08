"use server";

import { prisma } from "@/lib/prisma";
import { getPriceConfig } from "@/actions/config";
import { calcPriceArs, type PriceInfo } from "@/lib/price-utils";

export type StoreKit = {
    id: string;
    sku: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    priceUsd: number;
    priceArs: number;
    items: {
        productId: string | null;
        productName: string | null;
        childKitName: string | null;
        quantity: number;
    }[];
};

export async function getStoreKit(id: string): Promise<StoreKit | null> {
    const [kit, config] = await Promise.all([
        prisma.kit.findUnique({
            where: { id, deletedAt: null, isActive: true },
            include: {
                items: {
                    include: {
                        product: { select: { name: true } },
                        childKit: { select: { name: true } },
                    },
                },
            },
        }),
        getPriceConfig(),
    ]);
    if (!kit || !config) return null;
    const priceInfo: PriceInfo = { dollarRate: config.dollarRate, shippingPct: config.shippingPct, profitPct: config.profitPct };
    return {
        id: kit.id, sku: kit.sku, name: kit.name, description: kit.description, imageUrl: kit.imageUrl,
        priceUsd: Number(kit.price),
        priceArs: Math.round(calcPriceArs(Number(kit.price), priceInfo)),
        items: kit.items.map((i) => ({ productId: i.productId, productName: i.product?.name ?? null, childKitName: i.childKit?.name ?? null, quantity: i.quantity })),
    };
}

export async function getStoreKits(): Promise<{ kits: StoreKit[]; config: PriceInfo | null }> {
    const [kits, config] = await Promise.all([
        prisma.kit.findMany({
            where: { deletedAt: null, isActive: true },
            orderBy: { name: "asc" },
            include: {
                items: {
                    include: {
                        product: { select: { name: true } },
                        childKit: { select: { name: true } },
                    },
                },
            },
        }),
        getPriceConfig(),
    ]);

    if (!config) return { kits: [], config: null };

    const priceInfo: PriceInfo = {
        dollarRate: config.dollarRate,
        shippingPct: config.shippingPct,
        profitPct: config.profitPct,
    };

    return {
        kits: kits.map((k) => ({
            id: k.id,
            sku: k.sku,
            name: k.name,
            description: k.description,
            imageUrl: k.imageUrl,
            priceUsd: Number(k.price),
            priceArs: Math.round(calcPriceArs(Number(k.price), priceInfo)),
            items: k.items.map((i) => ({
                productId: i.productId,
                productName: i.product?.name ?? null,
                childKitName: i.childKit?.name ?? null,
                quantity: i.quantity,
            })),
        })),
        config: priceInfo,
    };
}
