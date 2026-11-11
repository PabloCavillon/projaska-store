import { describe, it, expect, vi, beforeEach } from "vitest";

const db = vi.hoisted(() => {
    const db = {
        product: { findMany: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
        productSyncLog: { createMany: vi.fn() },
        $transaction: vi.fn(),
    };
    db.$transaction.mockImplementation((fn: (tx: typeof db) => unknown) => fn(db));
    return db;
});
vi.mock("@/lib/prisma", () => ({ prisma: db }));

import { GET } from "@/app/api/price-sync/products/route";
import { POST } from "@/app/api/price-sync/update/route";

const TOKEN = "secreto-de-prueba";
const req = (body?: unknown, auth = `Bearer ${TOKEN}`) =>
    new Request("http://x/api/price-sync/update", {
        method: body === undefined ? "GET" : "POST",
        headers: { authorization: auth, "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
const product = { id: "p1", sku: "OLD-1", price: 40000, description: null };

beforeEach(() => {
    vi.clearAllMocks();
    process.env.PRICE_SYNC_API_KEY = TOKEN;
    db.product.findMany.mockResolvedValue([product]);
    db.product.findFirst.mockResolvedValue(null);
});

describe("auth", () => {
    it("401 sin token, con token incorrecto o sin la variable configurada", async () => {
        expect((await GET(req(undefined, ""))).status).toBe(401);
        expect((await GET(req(undefined, "Bearer otro"))).status).toBe(401);
        delete process.env.PRICE_SYNC_API_KEY;
        expect((await GET(req())).status).toBe(401);
    });
});

describe("GET /api/price-sync/products", () => {
    it("devuelve solo no borrados y el precio como número", async () => {
        db.product.findMany.mockResolvedValue([{
            id: "p1", sku: "A", model: null, name: "Cam", description: null, price: { toString: () => "12.5" },
            brand: "Dahua", category: "Cámaras", stockStatus: "inmediato", isMadeToOrder: true, showInStore: false,
            specs: ["IR 20 m"], imageUrl: null, sourceImageUrl: "https://prov/x.jpg", deletedAt: null,
            supplier: "lococo", sourceId: "prod_1", sourceUrl: "https://prov/#ficha/prod_1", imageWidth: 300, imageHeight: 200,
        }]);
        const res = await GET(req());
        expect(await res.json()).toEqual([{
            id: "p1", sku: "A", model: null, name: "Cam", description: null, price: 12.5, brand: "Dahua", category: "Cámaras",
            stockStatus: "inmediato", inStock: true, active: false, specs: ["IR 20 m"], imageUrl: null,
            sourceImageUrl: "https://prov/x.jpg", imageWidth: 300, imageHeight: 200,
            supplier: "lococo", sourceId: "prod_1", sourceUrl: "https://prov/#ficha/prod_1",
        }]);
        expect(db.product.findMany.mock.calls[0][0].where).toEqual({ deletedAt: null });
    });
});

describe("errores de base", () => {
    it("500 con JSON si Prisma falla (p. ej. columna faltante)", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        db.product.findMany.mockRejectedValue(Object.assign(new Error("ColumnNotFound"), { code: "P2022" }));
        for (const res of [await GET(req()), await POST(req({ match: { id: "p1" }, set: { price: 1 }, source: "n8n" }))]) {
            expect(res.status).toBe(500);
            expect(await res.json()).toEqual({ error: "Internal error" });
        }
    });
});

describe("POST /api/price-sync/update", () => {
    it("actualiza solo lo que cambia y lo registra", async () => {
        const res = await POST(req({ match: { sku: "OLD-1" }, set: { price: 47900, sku: "NEW-1" }, source: "n8n-lococo" }));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ id: "p1", changed: { price: [40000, 47900], sku: ["OLD-1", "NEW-1"] } });
        expect(db.product.update).toHaveBeenCalledWith({ where: { id: "p1" }, data: { price: 47900, sku: "NEW-1" } });
        expect(db.productSyncLog.createMany.mock.calls[0][0].data).toEqual([
            { productId: "p1", field: "price", oldValue: "40000", newValue: "47900", source: "n8n-lococo" },
            { productId: "p1", field: "sku", oldValue: "OLD-1", newValue: "NEW-1", source: "n8n-lococo" },
        ]);
    });

    it("sin cambios no escribe nada", async () => {
        const res = await POST(req({ match: { id: "p1" }, set: { price: 40000, sku: "OLD-1" }, source: "n8n" }));
        expect(await res.json()).toEqual({ id: "p1", changed: {} });
        expect(db.product.update).not.toHaveBeenCalled();
        expect(db.productSyncLog.createMany).not.toHaveBeenCalled();
    });

    it("404 si no encuentra y 409 si encuentra más de uno", async () => {
        db.product.findMany.mockResolvedValueOnce([]);
        expect((await POST(req({ match: { model: "X" }, set: { price: 1 }, source: "n8n" }))).status).toBe(404);
        db.product.findMany.mockResolvedValueOnce([product, { ...product, id: "p2" }]);
        expect((await POST(req({ match: { model: "X" }, set: { price: 1 }, source: "n8n" }))).status).toBe(409);
        expect(db.product.update).not.toHaveBeenCalled();
    });

    it("409 si el SKU nuevo ya lo usa otro producto", async () => {
        db.product.findFirst.mockResolvedValue({ id: "p9", name: "Otro" });
        const res = await POST(req({ match: { id: "p1" }, set: { sku: "TOMADO", price: 50000 }, source: "n8n" }));
        expect(res.status).toBe(409);
        expect((await res.json()).error).toMatch(/TOMADO/);
        expect(db.product.update).not.toHaveBeenCalled();
    });

    it("400 si match trae más de una clave, precio <= 0 o set vacío", async () => {
        for (const body of [
            { match: { id: "p1", sku: "A" }, set: { price: 1 }, source: "n8n" },
            { match: { id: "p1" }, set: { price: 0 }, source: "n8n" },
            { match: { id: "p1" }, set: {}, source: "n8n" },
            { match: { id: "p1" }, set: { sku: "  " }, source: "n8n" },
        ]) {
            expect((await POST(req(body))).status).toBe(400);
        }
    });
});
