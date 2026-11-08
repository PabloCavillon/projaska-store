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
