export type PriceInfo = {
    dollarRate: number;
    shippingPct: number;
    profitPct: number;
};

export function calcPriceArs(priceUsd: number, config: PriceInfo): number {
    return Math.round(
        priceUsd *
        config.dollarRate *
        (1 + config.shippingPct / 100) *
        (1 + config.profitPct / 100)
    );
}

export type DiscountConfig = {
    guildDiscountPct: number;
    volumeDiscountPct: number;
    volumeThresholdArs: number;
};

/** Descuento aplicable: el mayor entre gremio y volumen (no se suman). */
export function calcDiscount(subtotalArs: number, config: DiscountConfig, isGuild: boolean) {
    const guild = isGuild ? config.guildDiscountPct : 0;
    const volume = subtotalArs >= config.volumeThresholdArs ? config.volumeDiscountPct : 0;
    const pct = Math.max(guild, volume);
    const type: "GUILD" | "VOLUME" | null = pct === 0 ? null : guild >= volume ? "GUILD" : "VOLUME";
    const amountArs = subtotalArs * (pct / 100);
    return { pct, type, amountArs, totalArs: subtotalArs - amountArs };
}

export type SaleUnit = "unit" | "box";

export type PricedProduct = {
    priceUsd: number;
    unitsPerBox: number | null;
    offerDiscountPct: number | null;
    offerUnit: SaleUnit | null;
};

/**
 * Precio USD de una presentación (1 unidad o 1 caja) y cuántas unidades reales trae.
 * La oferta solo aplica a la presentación elegida en el panel. null = el producto no se vende por caja.
 */
export function priceOf(p: PricedProduct, unit: SaleUnit): { usd: number; units: number; isOffer: boolean } | null {
    const units = unit === "box" ? p.unitsPerBox ?? 0 : 1;
    if (units < 1) return null;
    const isOffer = p.offerDiscountPct !== null && p.offerUnit === unit;
    const regular = p.priceUsd * units;
    return { usd: isOffer ? regular * (1 - p.offerDiscountPct! / 100) : regular, units, isOffer };
}
