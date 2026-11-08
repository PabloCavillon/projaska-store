'use server'

import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/prisma";
import { sendPushToAdminsAndSellers } from "@/lib/web-push";
import { revocationSchema, type RevocationFormData } from "@/lib/validations/revocation";

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

/** Botón de arrepentimiento (Res. SCI 424/2020): público, sin cuenta, devuelve el código de la solicitud. */
export async function createRevocationRequest(raw: RevocationFormData): Promise<{ error: string } | { code: string }> {
	const parsed = revocationSchema.safeParse(raw);
	if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Revisá los datos." };
	const data = parsed.data;
	const orderCode = data.orderCode.toUpperCase();

	const order = await prisma.storeOrder.findUnique({ where: { code: orderCode }, select: { id: true } });
	if (!order) return { error: `No encontramos el pedido ${orderCode}. Revisá el código en el email o en Mis pedidos.` };

	const code = `ARR-${nanoid()}`;
	await prisma.revocationRequest.create({
		data: { code, orderCode, name: data.name, email: data.email.toLowerCase(), phone: data.phone || null, reason: data.reason || null },
	});

	await sendPushToAdminsAndSellers({
		title: "Botón de arrepentimiento",
		body: `${data.name} pidió revocar el pedido ${orderCode} (${code})`,
		url: "/admin/arrepentimientos",
	}).catch((e) => console.error("[revocation] push", e));

	return { code };
}
