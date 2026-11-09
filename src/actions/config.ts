"use server";

import { requireRole } from "@/lib/require-role";
import { priceConfigSchema } from "@/lib/validations/config";
import { prisma } from "@/lib/prisma";
import { PriceConfigFormData } from "@/lib/validations/config";
import { revalidatePath } from "next/cache";
import { getOfficialRate } from "@/lib/dollar-rate";

export type DollarRateResult =
    | { compra: number; venta: number; average: number; updatedAt: string }
    | { error: string };

export async function fetchOfficialDollarRate(): Promise<DollarRateResult> {
    await requireRole("ADMIN");
    try {
        return await getOfficialRate();
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
	dollarRateUpdatedAt: string | null;
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
		dollarRateUpdatedAt: config.dollarRateUpdatedAt?.toISOString() ?? null,
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
		const rateChanged = Number(existing.dollarRate) !== data.dollarRate;
		await prisma.priceConfig.update({
			where: { id: existing.id },
			data: { ...data, updatedById: session.user.id, ...(rateChanged && { dollarRateUpdatedAt: new Date() }) },
		});
	} else {
		await prisma.priceConfig.create({
			data: { ...data, updatedById: session.user.id, dollarRateUpdatedAt: new Date() },
		});
	}

	revalidatePath("/config");
}
