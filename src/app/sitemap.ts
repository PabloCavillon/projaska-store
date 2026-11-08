import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL as BASE_URL } from "@/lib/seo";

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
        { url: `${BASE_URL}/arrepentimiento`, changeFrequency: "yearly", priority: 0.3 },
        { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
        { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
        ...productUrls,
        ...kitUrls,
    ];
}
