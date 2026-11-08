"use server";

import { assertString } from "@/lib/validations/common";
import { requireRole } from "@/lib/require-role";
import { productSchema } from "@/lib/validations/product";
import { auth } from "@/auth";
import { Product } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { SerializedProduct } from "@/types/product";
import { revalidatePath } from "next/cache";

function serialize(p: Product): SerializedProduct {
	return {
		id: p.id,
		sku: p.sku,
		model: p.model,
		name: p.name,
		description: p.description,
		imageUrl: p.imageUrl,
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
	await prisma.product.create({ data });
	revalidatePath("/products");
};

export const updateProduct = async (
	id: string,
	data: {
		sku: string;
		model?: string | null;
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
	await prisma.product.update({
		where: { id },
		data,
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
