"use server";

import { requireRole } from "@/lib/require-role";
import { priceConfigSchema } from "@/lib/validations/config";
import { prisma } from "@/lib/prisma";
import { PriceConfigFormData } from "@/lib/validations/config";
import { revalidatePath } from "next/cache";

export type DollarRateResult =
    | { compra: number; venta: number; average: number; updatedAt: string }
    | { error: string };

export async function fetchOfficialDollarRate(): Promise<DollarRateResult> {
    try {
        const res = await fetch("https://dolarapi.com/v1/dolares/oficial", {
            next: { revalidate: 0 }, // siempre fresco
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const compra: number = data.compra;
        const venta: number = data.venta;
        const average = Math.round(((compra + venta) / 2) * 100) / 100;
        return { compra, venta, average, updatedAt: data.fechaActualizacion };
    } catch (err) {
        return { error: `No se pudo obtener la cotización: ${err instanceof Error ? err.message : "error desconocido"}` };
    }
}

export type SerializedPriceConfig = {
	id: string;
	dollarRate: number;
	shippingPct: number;
	profitPct: number;
	guildDiscountPct: number;
	volumeDiscountPct: number;
	volumeThresholdArs: number;
	updatedAt: string;
	updatedBy: { username: string } | null;
};

export async function getPriceConfig(): Promise<SerializedPriceConfig | null> {
	const config = await prisma.priceConfig.findFirst({
		include: { updatedBy: { select: { username: true } } },
		orderBy: { updatedAt: "desc" },
	});
	if (!config) return null;
	return {
		id: config.id,
		dollarRate: Number(config.dollarRate),
		shippingPct: Number(config.shippingPct),
		profitPct: Number(config.profitPct),
		guildDiscountPct: Number(config.guildDiscountPct),
		volumeDiscountPct: Number(config.volumeDiscountPct),
		volumeThresholdArs: Number(config.volumeThresholdArs),
		updatedAt: config.updatedAt.toISOString(),
		updatedBy: config.updatedBy,
	};
}

export async function updatePriceConfig(data: PriceConfigFormData) {
	const session = await requireRole("ADMIN");
	data = priceConfigSchema.parse(data);
	if (session.user.role !== "ADMIN") throw new Error("Forbidden");

	const existing = await prisma.priceConfig.findFirst();

	if (existing) {
		await prisma.priceConfig.update({
			where: { id: existing.id },
			data: { ...data, updatedById: session.user.id },
		});
	} else {
		await prisma.priceConfig.create({
			data: { ...data, updatedById: session.user.id },
		});
	}

	revalidatePath("/config");
}
