import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://projaska.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [products, kits] = await Promise.all([
        prisma.product.findMany({
            where: { deletedAt: null, showInStore: true },
            select: { id: true, updatedAt: true },
        }),
        prisma.kit.findMany({
            where: { deletedAt: null, isActive: true },
            select: { id: true, updatedAt: true },
        }),
    ]);

    const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
        url: `${BASE_URL}/products/${p.id}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    const kitUrls: MetadataRoute.Sitemap = kits.map((k) => ({
        url: `${BASE_URL}/kits/${k.id}`,
        lastModified: k.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
    }));

    return [
        { url: BASE_URL, changeFrequency: "daily", priority: 1 },
        { url: `${BASE_URL}/catalog`, changeFrequency: "daily", priority: 0.9 },
        ...productUrls,
        ...kitUrls,
    ];
}
