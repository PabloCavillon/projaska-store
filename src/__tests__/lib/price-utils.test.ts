import { describe, it, expect } from "vitest";
import { calcPriceArs, calcDiscount } from "@/lib/price-utils";

const base = { dollarRate: 1000, shippingPct: 10, profitPct: 20 };

describe("calcPriceArs", () => {
    it("calcula correctamente con márgenes típicos", () => {
        // 100 USD × 1000 × 1.10 × 1.20 = 132,000
        expect(calcPriceArs(100, base)).toBe(132_000);
    });

    it("devuelve 0 si el precio USD es 0", () => {
        expect(calcPriceArs(0, base)).toBe(0);
    });

    it("devuelve 0 si la cotización del dólar es 0", () => {
        expect(calcPriceArs(100, { ...base, dollarRate: 0 })).toBe(0);
    });

    it("sin márgenes el precio ARS es solo precio × cotización", () => {
        expect(calcPriceArs(50, { dollarRate: 1000, shippingPct: 0, profitPct: 0 })).toBe(50_000);
    });

    it("aplica solo envío sin ganancia", () => {
        // 100 × 1000 × 1.10 = 110,000
        expect(calcPriceArs(100, { dollarRate: 1000, shippingPct: 10, profitPct: 0 })).toBeCloseTo(110_000);
    });

    it("aplica solo ganancia sin envío", () => {
        // 100 × 1000 × 1.20 = 120,000
        expect(calcPriceArs(100, { dollarRate: 1000, shippingPct: 0, profitPct: 20 })).toBe(120_000);
    });

    it("funciona con precios fraccionales en USD", () => {
        // 0.5 × 1000 × 1.10 × 1.20 = 660
        expect(calcPriceArs(0.5, base)).toBeCloseTo(660);
    });

    it("escala linealmente con el precio USD", () => {
        const single = calcPriceArs(1, base);
        expect(calcPriceArs(5, base)).toBeCloseTo(single * 5);
    });
});

describe("calcDiscount", () => {
    const cfg = { guildDiscountPct: 15, volumeDiscountPct: 10, volumeThresholdArs: 500_000 };

    it("sin gremio y bajo el umbral no descuenta", () => {
        expect(calcDiscount(100_000, cfg, false)).toEqual({ pct: 0, type: null, amountArs: 0, totalArs: 100_000 });
    });

    it("aplica volumen al alcanzar el umbral", () => {
        const d = calcDiscount(500_000, cfg, false);
        expect(d.type).toBe("VOLUME");
        expect(d.totalArs).toBe(450_000);
    });

    it("gremio gana sobre volumen cuando es mayor (no se suman)", () => {
        const d = calcDiscount(600_000, cfg, true);
        expect(d.type).toBe("GUILD");
        expect(d.pct).toBe(15);
    });
});
