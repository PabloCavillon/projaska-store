"use server";

import { assertString } from "@/lib/validations/common";
import { requireRole } from "@/lib/require-role";
import { productSchema } from "@/lib/validations/product";
import { auth } from "@/auth";
import { Product } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { SerializedProduct } from "@/types/product";
import { measureImageUrl } from "@/lib/product-image";
import { revalidatePath } from "next/cache";

function serialize(p: Product): SerializedProduct {
	return {
		id: p.id,
		sku: p.sku,
		model: p.model,
		brand: p.brand,
		name: p.name,
		description: p.description,
		imageUrl: p.imageUrl,
		imageWidth: p.imageWidth,
		imageHeight: p.imageHeight,
		sourceUrl: p.sourceUrl,
		price: Number(p.price),
		stock: p.stock,
		category: p.category,
		unitsPerBox: p.unitsPerBox ?? null,
		offerDiscountPct: p.offerDiscountPct != null ? Number(p.offerDiscountPct) : null,
		offerUnit: p.offerUnit ?? null,
		isMadeToOrder: p.isMadeToOrder,
		showInStore: p.showInStore,
		createdAt: p.createdAt.toISOString(),
		updatedAt: p.updatedAt.toISOString(),
		deletedAt: p.deletedAt?.toISOString() ?? null,
	};
}

export async function getProducts(): Promise<SerializedProduct[]> {
	const session = await auth();
	if (!session?.user?.id) throw new Error("No autorizado");

	const products = await prisma.product.findMany({
		where: { deletedAt: null },
		orderBy: { createdAt: "desc" },
	});
	return products.map(serialize);
}

export async function getProduct(
	id: string,
): Promise<SerializedProduct | null> {
	id = assertString(id);
	const session = await auth();
	if (!session?.user?.id) throw new Error("No autorizado");

	const product = await prisma.product.findUnique({
		where: { id, deletedAt: null },
	});

	if (!product) return null;
	return serialize(product);
}

export const createProduct = async (data: {
	sku: string;
	model?: string | null;
	brand?: string | null;
	name: string;
	description?: string;
	imageUrl?: string;
	price: number;
	stock: number;
	category: string;
	unitsPerBox?: number | null;
	offerDiscountPct?: number | null;
	offerUnit?: string | null;
	isMadeToOrder?: boolean;
	showInStore?: boolean;
}) => {
	await requireRole("ADMIN", "SELLER");
	data = productSchema.parse(data);
	const size = data.imageUrl ? await measureImageUrl(data.imageUrl) : {};
	await prisma.product.create({ data: { ...data, ...size } });
	revalidatePath("/products");
};

export const updateProduct = async (
	id: string,
	data: {
		sku: string;
		model?: string | null;
		brand?: string | null;
		name: string;
		description?: string;
		imageUrl?: string;
		stock: number;
		price: number;
		category: string;
		unitsPerBox?: number | null;
		offerDiscountPct?: number | null;
		offerUnit?: string | null;
		isMadeToOrder?: boolean;
		showInStore?: boolean;
	},
) => {
	id = assertString(id);
	await requireRole("ADMIN", "SELLER");
	data = productSchema.parse(data);
	// Foto nueva: medirla para que salga (o entre) en el filtro "Fotos de baja calidad"
	const prev = await prisma.product.findUnique({ where: { id }, select: { imageUrl: true } });
	const size = data.imageUrl && data.imageUrl !== prev?.imageUrl ? await measureImageUrl(data.imageUrl) : {};
	await prisma.product.update({
		where: { id },
		data: { ...data, ...size },
	});
	revalidatePath("/products");
};

export async function deleteProduct(id: string) {
	id = assertString(id);
	await requireRole("ADMIN", "SELLER");
	await prisma.product.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
	revalidatePath("/products");
}

export async function setProductShowInStore(id: string, showInStore: boolean) {
	id = assertString(id);
	if (typeof showInStore !== "boolean") throw new Error("Parámetro inválido");
	await requireRole("ADMIN", "SELLER");
	await prisma.product.update({ where: { id, deletedAt: null }, data: { showInStore } });
	revalidatePath("/admin/products");
}
