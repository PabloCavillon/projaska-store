"use server";

import { requireRole } from "@/lib/require-role";
import { kitSchema } from "@/lib/validations/kit";
import { prisma } from "@/lib/prisma";
import { KitFormData } from "@/lib/validations/kit";
import { SerializedKit, SerializedKitItem } from "@/types/kit";
import { KitItem, Kit, Product } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

type KitItemWithRels = KitItem & {
    product: Pick<Product, "name" | "sku"> | null;
    childKit: Pick<Kit, "name" | "sku"> | null;
};

function serializeItem(item: KitItemWithRels): SerializedKitItem {
    return {
        id: item.id,
        kitId: item.kitId,
        productId: item.productId,
        productName: item.product?.name ?? null,
        productSku: item.product?.sku ?? null,
        childKitId: item.childKitId,
        childKitName: item.childKit?.name ?? null,
        childKitSku: item.childKit?.sku ?? null,
        quantity: item.quantity,
    };
}

function serializeKit(kit: Kit & { items: KitItemWithRels[] }): SerializedKit {
    return {
        id: kit.id,
        sku: kit.sku,
        name: kit.name,
        description: kit.description,
        imageUrl: kit.imageUrl,
        price: Number(kit.price),
        isActive: kit.isActive,
        createdAt: kit.createdAt.toISOString(),
        updatedAt: kit.updatedAt.toISOString(),
        deletedAt: kit.deletedAt?.toISOString() ?? null,
        items: kit.items.map(serializeItem),
    };
}

const itemInclude = {
    product: { select: { name: true, sku: true } },
    childKit: { select: { name: true, sku: true } },
} as const;

export async function getKits(): Promise<SerializedKit[]> {
    await requireRole("ADMIN", "SELLER");
    const kits = await prisma.kit.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: { items: { include: itemInclude } },
    });
    return kits.map(serializeKit);
}

export async function getKit(id: string): Promise<SerializedKit | null> {
    await requireRole("ADMIN", "SELLER");
    const kit = await prisma.kit.findUnique({
        where: { id, deletedAt: null },
        include: { items: { include: itemInclude } },
    });
    if (!kit) return null;
    return serializeKit(kit);
}

export async function createKit(data: KitFormData) {
    await requireRole("ADMIN", "SELLER");
    data = kitSchema.parse(data);

    const { items, ...kitData } = data;
    await prisma.kit.create({
        data: {
            ...kitData,
            items: {
                create: items.map((item) => ({
                    productId: item.productId ?? null,
                    childKitId: item.childKitId ?? null,
                    quantity: item.quantity,
                })),
            },
        },
    });
    revalidatePath("/kits");
}

export async function updateKit(id: string, data: KitFormData) {
    await requireRole("ADMIN", "SELLER");
    data = kitSchema.parse(data);

    const { items, ...kitData } = data;
    await prisma.$transaction([
        prisma.kitItem.deleteMany({ where: { kitId: id } }),
        prisma.kit.update({
            where: { id },
            data: {
                ...kitData,
                items: {
                    create: items.map((item) => ({
                        productId: item.productId ?? null,
                        childKitId: item.childKitId ?? null,
                        quantity: item.quantity,
                    })),
                },
            },
        }),
    ]);
    revalidatePath("/kits");
    revalidatePath(`/kits/${id}/edit`);
}

export async function deleteKit(id: string) {
    await requireRole("ADMIN", "SELLER");
    await prisma.kit.update({
        where: { id },
        data: { deletedAt: new Date() },
    });
    revalidatePath("/kits");
}
