"use server";

import { requireRole } from "@/lib/require-role";
import { customerSchema } from "@/lib/validations/customer";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SerializedCustomer } from "@/types/customer";
import { revalidatePath } from "next/cache";

function serialize(c: any): SerializedCustomer {
	return {
		...c,
		createdAt: c.createdAt.toISOString(),
		updatedAt: c.updatedAt.toISOString(),
		deletedAt: c.deletedAt?.toISOString(),
	};
}

export const getCustomers = async (): Promise<SerializedCustomer[]> => {
	const session = await auth();
	if (!session?.user?.id) throw new Error("No autorizado");

	const customers = await prisma.customer.findMany({
		where: { deletedAt: null },
		orderBy: { name: "asc" },
	});

	return customers.map(serialize);
};

export const getCustomer = async (id: string): Promise<SerializedCustomer> => {
	const session = await auth();
	if (!session?.user?.id) throw new Error("No autorizado");

	const customer = await prisma.customer.findUnique({
		where: { id, deletedAt: null },
	});

	return serialize(customer);
};

export const createCustomer = async (data: {
	name: string;
	email?: string;
	phone?: string;
	address?: string;
	notes?: string;
	isGuild?: boolean;
}) => {
	await requireRole("ADMIN", "SELLER");
	data = customerSchema.parse(data);
	await prisma.customer.create({ data });
	revalidatePath("/customers");
};

export const updateCustomer = async (
	id: string,
	data: {
		name: string;
		email?: string;
		phone?: string;
		address?: string;
		notes?: string;
		isGuild?: boolean;
	},
) => {
	await requireRole("ADMIN", "SELLER");
	data = customerSchema.parse(data);

	await prisma.$transaction(async (tx) => {
		await tx.customer.update({ where: { id }, data });

		// Sincronizar datos de contacto con StoreCustomer si existe vínculo
		await tx.storeCustomer.updateMany({
			where: { customerId: id, deletedAt: null },
			data: {
				name: data.name,
				email: data.email,
				phone: data.phone,
				address: data.address,
			},
		});
	});

	revalidatePath("/customers");
};

export const deleteCustomer = async (id: string) => {
	await requireRole("ADMIN", "SELLER");
	await prisma.customer.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
};
