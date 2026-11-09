import { prisma } from "@/lib/prisma";

export type OfficialRate = { compra: number; venta: number; average: number; updatedAt: string };

/** Dólar oficial de dolarapi.com. Tira error si la API falla o devuelve algo que no es un número positivo. */
export async function getOfficialRate(): Promise<OfficialRate> {
    const res = await fetch("https://dolarapi.com/v1/dolares/oficial", { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const compra = Number(data?.compra);
    const venta = Number(data?.venta);
    if (!Number.isFinite(compra) || !Number.isFinite(venta) || compra <= 0 || venta <= 0) {
        throw new Error("la API devolvió una cotización inválida");
    }
    return { compra, venta, average: Math.round(((compra + venta) / 2) * 100) / 100, updatedAt: data.fechaActualizacion };
}

/** Un salto mayor a esto en una hora es más probable que sea un error de la API que un cambio real: no se aplica solo. */
export const MAX_AUTO_CHANGE_PCT = 25;

export type RefreshResult =
    | { status: "updated" | "unchanged"; previous: number; dollarRate: number; checkedAt: string }
    | { status: "rejected"; previous: number; fetched: number; reason: string };

/** Trae el dólar oficial y lo guarda en PriceConfig. Lo llama n8n cada hora vía /api/dollar-rate/refresh. */
export async function refreshDollarRate(): Promise<RefreshResult> {
    const config = await prisma.priceConfig.findFirst({ orderBy: { updatedAt: "desc" } });
    if (!config) throw new Error("No hay configuración de precios");

    const rate = await getOfficialRate();
    const previous = Number(config.dollarRate);
    const changePct = previous > 0 ? (Math.abs(rate.average - previous) / previous) * 100 : 0;
    if (changePct > MAX_AUTO_CHANGE_PCT) {
        return {
            status: "rejected", previous, fetched: rate.average,
            reason: `Cambio de ${changePct.toFixed(1)}% (máximo automático ${MAX_AUTO_CHANGE_PCT}%). Revisalo y actualizalo a mano en Configuración.`,
        };
    }

    const now = new Date();
    await prisma.priceConfig.update({
        where: { id: config.id },
        // updatedAt se conserva: "Última actualización por X" sigue hablando de los cambios manuales.
        data: { dollarRate: rate.average, dollarRateUpdatedAt: now, updatedAt: config.updatedAt },
    });
    return { status: rate.average === previous ? "unchanged" : "updated", previous, dollarRate: rate.average, checkedAt: now.toISOString() };
}
