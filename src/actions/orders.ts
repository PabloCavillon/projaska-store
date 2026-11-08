"use server";

import { requireRole } from "@/lib/require-role";
import { orderSchema } from "@/lib/validations/order";
import { auth } from "@/auth";
import { OrderStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { OrderFormData } from "@/lib/validations/order";
import { SerializedOrder } from "@/types/order";
import { revalidatePath } from "next/cache";
import { customAlphabet } from "nanoid";

/*******************  NANOID  **********************/

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890", 8);

/*******************  NANOID  **********************/

function serializeOrder(order: any): SerializedOrder {
	return {
		...order,
		total: Number(order.total),
		createdAt: order.createdAt.toISOString(),
		updatedAt: order.updatedAt.toISOString(),
		items: order.items.map((item: any) => ({
			...item,
			unitPrice: Number(item.unitPrice),
		})),
	};
}

export async function getOrders(): Promise<SerializedOrder[]> {
	const session = await auth();
	if (!session?.user?.id) throw new Error("No autorizado");

	const orders = await prisma.order.findMany({
		orderBy: { createdAt: "desc" },
		include: {
			customer: { select: { id: true, name: true } },
			user: { select: { id: true, username: true } },
			items: {
				include: {
					product: { select: { id: true, name: true, sku: true } },
				},
			},
		},
	});
	return orders.map(serializeOrder);
}

export async function getOrder(id: string): Promise<SerializedOrder | null> {
	const session = await auth();
	if (!session?.user?.id) throw new Error("No autorizado");

	const order = await prisma.order.findUnique({
		where: { id },
		include: {
			customer: { select: { id: true, name: true } },
			user: { select: { id: true, username: true } },
			items: {
				include: {
					product: { select: { id: true, name: true, sku: true } },
				},
			},
		},
	});
	if (!order) return null;
	return serializeOrder(order);
}

export async function createOrder(data: OrderFormData) {
	const session = await requireRole("ADMIN", "SELLER");
	data = orderSchema.parse(data);

	const total = data.items.reduce(
		(acc, item) => acc + item.unitPrice * item.quantity,
		0,
	);

	await prisma.order.create({
		data: {
			customerId: data.customerId,
			userId: session.user.id,
			code: `ORD-${nanoid()}`,
			total,
			notes: data.notes,
			items: {
				create: data.items.map((item) => ({
					productId: item.productId,
					quantity: item.quantity,
					unitPrice: item.unitPrice,
				})),
			},
		},
	});
	revalidatePath("/orders");
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
	const session = await requireRole("ADMIN", "SELLER", "WAREHOUSE");

	const order = await prisma.order.findUnique({
		where: { id },
		include: { items: true },
	});

	if (!order) throw new Error("Order not found");

	if (status === "CONFIRMED" && order.status === "PENDING") {
		await prisma.$transaction(async (tx) => {
			// Cambiar el estado primero y solo si sigue PENDING: un doble clic no descuenta dos veces
			const claimed = await tx.order.updateMany({ where: { id, status: "PENDING" }, data: { status } });
			if (claimed.count === 0) return;
			for (const item of order.items) {
				await tx.product.update({
					where: { id: item.productId },
					data: { stock: { decrement: item.quantity } },
				});

				await tx.stockMovement.create({
					data: {
						productId: item.productId,
						orderId: order.id,
						userId: session.user!.id!,
						type: "OUT",
						quantity: item.quantity,
						reason: "Venta",
					},
				});
			}
		});
	} else {
		await prisma.order.update({
			where: { id },
			data: { status },
		});
	}
	revalidatePath("/orders");
}
