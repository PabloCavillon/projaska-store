'use server'

import { prisma } from "@/lib/prisma";
import {
	createStoreSession,
	deleteStoreSession,
	getStoreSession,
} from "@/lib/store-auth";
import { LoginFormData, RegisterFormData } from "@/lib/validations/store-auth";
import { safeRedirect } from "@/lib/utils";
import { compare, hash } from "bcryptjs";
import { redirect } from "next/navigation"; // used by logoutStoreCustomer

const SALT_ROUNDS = 12;

export async function loginStoreCustomer(
	data: LoginFormData,
): Promise<{ error: string } | { redirectTo: string }> {
	const customer = await prisma.storeCustomer.findUnique({
		where: { email: data.email.toLowerCase().trim(), deletedAt: null },
	});

	if (!customer) return { error: "Email o contraseña incorrectos." };

	const isPasswordValid = await compare(data.password, customer.passwordHash);
	if (!isPasswordValid) return { error: "Email o contraseña incorrectos." };

	await createStoreSession({
		id: customer.id,
		name: customer.name,
		email: customer.email,
	});

	return { redirectTo: safeRedirect(data.redirect) };
}

export async function registerStoreCustomer(
	data: RegisterFormData,
): Promise<{ error: string } | { redirectTo: string }> {
	const existing = await prisma.storeCustomer.findUnique({
		where: { email: data.email.toLowerCase() },
	});

	if (existing) return { error: "Ya existe una cuenta con ese email." };

	const panelCustomer = await prisma.customer.findFirst({
		where: { email: data.email.toLowerCase(), deletedAt: null },
	});

	const passwordHash = await hash(data.password, SALT_ROUNDS);

	const newCustomer = await prisma.storeCustomer.create({
		data: {
			name: data.name.trim(),
			email: data.email.toLowerCase(),
			phone: data.phone?.trim() || null,
			passwordHash,
			customerId: panelCustomer?.id ?? null,
		},
	});

	await createStoreSession({
		id: newCustomer.id,
		name: newCustomer.name,
		email: newCustomer.email,
	});

	return { redirectTo: safeRedirect(data.redirect) };
}

export async function logoutStoreCustomer(): Promise<void> {
	await deleteStoreSession();
	redirect("/login");
}

export async function updateStoreCustomerProfile(data: {
	name: string;
	email?: string;
	phone?: string;
	address?: string;
}): Promise<{ error?: string }> {
	const session = await getStoreSession();
	if (!session) return { error: "No autorizado." };

	await prisma.$transaction(async (tx) => {
		const updated = await tx.storeCustomer.update({
			where: { id: session.id, deletedAt: null },
			data,
			select: { customerId: true },
		});

		if (updated.customerId) {
			await tx.customer.update({
				where: { id: updated.customerId },
				data: {
					name: data.name,
					email: data.email,
					phone: data.phone,
					address: data.address,
				},
			});
		}
	});

	return {};
}

const ACTIVE_ORDER_STATUSES = ["PENDING", "PAYMENT_REGISTERED", "CONFIRMED", "SHIPPED"] as const;

/**
 * Baja de cuenta pedida por el cliente. Los pedidos se conservan por obligación fiscal, así que la cuenta no se
 * borra: se anonimiza (sin nombre, email, teléfono ni dirección) y se marca deletedAt. El email queda libre para
 * volver a registrarse.
 */
export async function deleteStoreAccount(password: string): Promise<{ error: string } | { code: string }> {
	const session = await getStoreSession();
	if (!session) return { error: "Tu sesión expiró. Ingresá de nuevo." };

	const customer = await prisma.storeCustomer.findUnique({ where: { id: session.id, deletedAt: null } });
	if (!customer || !(await compare(password, customer.passwordHash))) return { error: "La contraseña no es correcta." };

	const activeOrders = await prisma.storeOrder.count({
		where: { storeCustomerId: customer.id, deletedAt: null, status: { in: [...ACTIVE_ORDER_STATUSES] } },
	});
	if (activeOrders > 0) {
		return { error: `Tenés ${activeOrders} pedido${activeOrders > 1 ? "s" : ""} en curso. Cuando se entreguen o se cancelen vas a poder darte de baja, o escribinos y lo resolvemos.` };
	}

	await prisma.storeCustomer.update({
		where: { id: customer.id },
		data: {
			name: "Cuenta dada de baja",
			email: `baja-${customer.id}@projaska.invalid`,
			phone: null,
			address: null,
			passwordHash: "",
			customerId: null,
			deletedAt: new Date(),
		},
	});
	await deleteStoreSession();

	return { code: `BAJA-${customer.id.slice(0, 8).toUpperCase()}` };
}
