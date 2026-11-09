import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const db = vi.hoisted(() => ({ priceConfig: { findFirst: vi.fn(), update: vi.fn() } }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));

import { POST } from "@/app/api/dollar-rate/refresh/route";

const TOKEN = "secreto-de-prueba";
const req = (auth = `Bearer ${TOKEN}`) => new Request("http://x/api/dollar-rate/refresh", { method: "POST", headers: { authorization: auth } });
const manualAt = new Date("2026-11-01T10:00:00Z");
const mockApi = (body: unknown, ok = true) =>
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(body), { status: ok ? 200 : 503 }));

beforeEach(() => {
    vi.clearAllMocks();
    process.env.PRICE_SYNC_API_KEY = TOKEN;
    db.priceConfig.findFirst.mockResolvedValue({ id: "cfg", dollarRate: 1000, updatedAt: manualAt });
});
afterEach(() => vi.restoreAllMocks());

describe("POST /api/dollar-rate/refresh", () => {
    it("401 sin la API key, sin llamar a la API ni a la base", async () => {
        const f = mockApi({ compra: 1, venta: 1 });
        expect((await POST(req("Bearer otra"))).status).toBe(401);
        expect(f).not.toHaveBeenCalled();
        expect(db.priceConfig.update).not.toHaveBeenCalled();
    });

    it("guarda el promedio compra/venta, la fecha, y conserva updatedAt", async () => {
        mockApi({ compra: 1040, venta: 1090, fechaActualizacion: "2026-11-09T12:00:00Z" });
        const res = await POST(req());
        expect(res.status).toBe(200);
        expect(await res.json()).toMatchObject({ status: "updated", previous: 1000, dollarRate: 1065 });
        const data = db.priceConfig.update.mock.calls[0][0].data;
        expect(data.dollarRate).toBe(1065);
        expect(data.dollarRateUpdatedAt).toBeInstanceOf(Date);
        expect(data.updatedAt).toBe(manualAt);
    });

    it("409 y no toca nada si el salto supera el 25%", async () => {
        mockApi({ compra: 1500, venta: 1500 });
        const res = await POST(req());
        expect(res.status).toBe(409);
        expect((await res.json()).status).toBe("rejected");
        expect(db.priceConfig.update).not.toHaveBeenCalled();
    });

    it("502 y no toca nada si la API falla o devuelve basura", async () => {
        mockApi({}, false);
        expect((await POST(req())).status).toBe(502);
        mockApi({ compra: "abc", venta: 0 });
        expect((await POST(req())).status).toBe(502);
        expect(db.priceConfig.update).not.toHaveBeenCalled();
    });
});
