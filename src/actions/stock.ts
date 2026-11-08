"use server";

import { requireRole } from "@/lib/require-role";
import { stockMovementSchema } from "@/lib/validations/stock";
import { prisma } from "@/lib/prisma";
import { StockMovementFormData } from "@/lib/validations/stock";
import { SerializedStockMovement } from "@/types/stock";
import { revalidatePath } from "next/cache";

function serializedMovement(m: any): SerializedStockMovement {
	return {
		...m,
		createdAt: m.createdAt.toISOString(),
	};
}

export async function getStockMovements(): Promise<SerializedStockMovement[]> {
	await requireRole("ADMIN", "WAREHOUSE");
	const movements = await prisma.stockMovement.findMany({
		orderBy: { createdAt: "desc" },
		include: {
			product: { select: { id: true, name: true, sku: true } },
			user: { select: { id: true, username: true } },
			order: { select: { id: true } },
		},
	});
	return movements.map(serializedMovement);
}

export async function createStockMovement(data: StockMovementFormData) {
	const session = await requireRole("ADMIN", "WAREHOUSE");
	data = stockMovementSchema.parse(data);

	await prisma.$transaction(async (tx) => {
		await tx.stockMovement.create({
			data: {
				productId: data.productId,
				userId: session.user!.id!,
				type: data.type,
				quantity: data.quantity,
				reason: data.reason,
			},
		});

		await tx.product.update({
			where: { id: data.productId },
			data: {
				stock: {
					increment:
						data.type === "IN" ? data.quantity : -data.quantity,
				},
			},
		});
	});

	revalidatePath("/stock");
	revalidatePath("/products");
}
