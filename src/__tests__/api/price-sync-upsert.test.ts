import { describe, it, expect, vi, beforeEach } from "vitest";
import sharp from "sharp";

const db = vi.hoisted(() => {
    const db = {
        product: { findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
        productSyncLog: { create: vi.fn(), createMany: vi.fn() },
        $transaction: vi.fn(),
    };
    db.$transaction.mockImplementation((fn: (tx: typeof db) => unknown) => fn(db));
    return db;
});
const put = vi.hoisted(() => vi.fn());
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("@vercel/blob", () => ({ put }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { POST } from "@/app/api/price-sync/upsert/route";
import { upsertItemSchema } from "@/lib/validations/price-sync";

const TOKEN = "secreto-de-prueba";
const req = (body: unknown, auth = `Bearer ${TOKEN}`) =>
    new Request("http://x/api/price-sync/upsert", {
        method: "POST",
        headers: { authorization: auth, "content-type": "application/json" },
        body: JSON.stringify(body),
    });
const run = async (...items: unknown[]) => (await (await POST(req({ source: "n8n-lococo", items }))).json()).results;

const row = (o: Record<string, unknown> = {}) => ({
    id: "p1", sku: "CAM-1", model: "DH-IPC 1230", name: "Cámara", description: null, price: 17.4, brand: "Dahua",
    category: "Cámaras", stockStatus: "inmediato", isMadeToOrder: true, showInStore: true, specs: [], imageUrl: null,
    sourceImageUrl: null, deletedAt: null, supplier: "lococo", sourceId: null, sourceUrl: null, imageWidth: null, imageHeight: null, ...o,
});
const newItem = { model: "DS-2CD", name: "Domo", price: 18, brand: "DAHUA", category: "camaras" };

beforeEach(() => {
    vi.clearAllMocks();
    process.env.PRICE_SYNC_API_KEY = TOKEN;
    db.product.findMany.mockResolvedValue([row(), row({ id: "p2", sku: "DS-2CD", model: null, brand: "Hikvision", deletedAt: new Date() })]);
    db.product.create.mockImplementation(({ data }: { data: Record<string, unknown> }) => row({ ...data, id: "new", deletedAt: null }));
    vi.stubGlobal("fetch", vi.fn());
});

describe("validación", () => {
    it("create exige model, name y price > 0; specs acotadas", () => {
        expect(upsertItemSchema.safeParse({ op: "create", match: null, data: newItem }).success).toBe(true);
        expect(upsertItemSchema.safeParse({ op: "create", data: { ...newItem, name: undefined } }).success).toBe(false);
        expect(upsertItemSchema.safeParse({ op: "create", data: { ...newItem, price: 0 } }).success).toBe(false);
        expect(upsertItemSchema.safeParse({ op: "create", data: { ...newItem, specs: Array(41).fill("x") } }).success).toBe(false);
        expect(upsertItemSchema.safeParse({ op: "create", data: { ...newItem, specs: ["x".repeat(201)] } }).success).toBe(false);
        expect(upsertItemSchema.safeParse({ op: "update", match: null, data: { price: 1 } }).success).toBe(false);
        expect(upsertItemSchema.safeParse({ op: "update", match: { id: "p1" }, data: { stockStatus: "otro" } }).success).toBe(false);
        expect(upsertItemSchema.safeParse({ op: "update", match: { sourceId: "prod_1" }, data: { imageUrl: null } }).success).toBe(true);
        expect(upsertItemSchema.safeParse({ op: "update", match: { id: "p1", sourceId: "x" }, data: {} }).success).toBe(false);
        expect(upsertItemSchema.safeParse({ op: "create", data: { ...newItem, sourceUrl: "http://prov/x" } }).success).toBe(false);
    });

    it("401 sin token y 400 con body inválido o más de 100 items", async () => {
        expect((await POST(req({ source: "x", items: [{}] }, "Bearer otro"))).status).toBe(401);
        expect((await POST(req({ items: [{}] }))).status).toBe(400);
        expect((await POST(req({ source: "x", items: Array(101).fill({}) }))).status).toBe(400);
    });
});

describe("POST /api/price-sync/upsert", () => {
    it("crea: sku con sufijo si choca, marca y categoría existentes sin importar mayúsculas/tildes", async () => {
        const [r] = await run({ op: "create", match: null, data: newItem });
        expect(r).toEqual({ index: 0, id: "new", model: "DS-2CD", status: "created" });
        const data = db.product.create.mock.calls[0][0].data;
        expect(data).toMatchObject({ sku: "DS-2CD-2", brand: "Dahua", category: "Cámaras", isMadeToOrder: true, showInStore: true, specs: [] });
        expect(db.productSyncLog.create.mock.calls[0][0].data).toMatchObject({ field: "created", op: "create", source: "n8n-lococo" });
    });

    it("create con un model que ya existe (sin guiones/espacios/mayúsculas) actualiza ese producto", async () => {
        const [r] = await run({ op: "create", data: { ...newItem, model: "dhipc1230", name: "Cámara", category: "Cámaras", brand: "dahua", price: 19 } });
        expect(r).toEqual({ index: 0, id: "p1", status: "updated", changed: ["model", "price"] });
        expect(db.product.create).not.toHaveBeenCalled();
    });

    it("update parcial: solo toca y registra lo que cambia; sin cambios no escribe", async () => {
        const [a, b] = await run(
            { op: "update", match: { id: "p1" }, data: { price: 19.4, stockStatus: "deposito_2", brand: "Dahua" } },
            { op: "update", match: { id: "p1" }, data: { price: 19.4 } },
        );
        expect(a).toEqual({ index: 0, id: "p1", status: "updated", changed: ["price", "stockStatus"] });
        expect(b).toEqual({ index: 1, id: "p1", status: "unchanged" });
        expect(db.product.update).toHaveBeenCalledTimes(1);
        expect(db.product.update.mock.calls[0][0]).toEqual({ where: { id: "p1" }, data: { price: 19.4, stockStatus: "deposito_2" } });
        expect(db.productSyncLog.createMany.mock.calls[0][0].data).toEqual([
            { productId: "p1", field: "price", oldValue: "17.4", newValue: "19.4", op: "update", source: "n8n-lococo" },
            { productId: "p1", field: "stockStatus", oldValue: "inmediato", newValue: "deposito_2", op: "update", source: "n8n-lococo" },
        ]);
    });

    it("deactivate oculta y marca sin stock (showInStore/isMadeToOrder)", async () => {
        const [r] = await run({ op: "deactivate", match: { id: "p1" }, data: { active: false, inStock: false } });
        expect(r).toEqual({ index: 0, id: "p1", status: "deactivated", changed: ["inStock", "active"] });
        expect(db.product.update.mock.calls[0][0].data).toEqual({ showInStore: false, isMadeToOrder: false });
    });

    it("un item con error no frena el lote", async () => {
        const results = await run(
            { op: "update", match: { id: "nope" }, data: { price: 1 } },
            { op: "update", match: { id: "p1" }, data: { price: -1 } },
            { op: "update", match: { id: "p1" }, data: { price: 20 } },
        );
        expect(results.map((r: { status: string }) => r.status)).toEqual(["error", "error", "updated"]);
        expect(results[0].error).toMatch(/nope/);
    });

    it("match por sourceId; create con sourceId existente no duplica", async () => {
        db.product.findMany.mockResolvedValue([row({ sourceId: "prod_10018" })]);
        const [a, b] = await run(
            { op: "update", match: { sourceId: "prod_10018" }, data: { price: 20, sourceUrl: "https://prov/#ficha/prod_10018" } },
            { op: "create", data: { ...newItem, sourceId: "prod_10018" } },
        );
        expect(a).toEqual({ index: 0, id: "p1", status: "updated", changed: ["price", "sourceUrl"] });
        expect(b).toMatchObject({ status: "error", error: expect.stringMatching(/p1/) });
        expect(db.product.create).not.toHaveBeenCalled();
    });

    it("imageUrl: null borra la foto y sus medidas", async () => {
        db.product.findMany.mockResolvedValue([row({ imageUrl: "https://blob/sin-foto.png", imageWidth: 100, imageHeight: 100 })]);
        const [r] = await run({ op: "update", match: { id: "p1" }, data: { imageUrl: null } });
        expect(r).toEqual({ index: 0, id: "p1", status: "updated", changed: ["imageUrl"] });
        expect(db.product.update.mock.calls[0][0].data).toEqual({ imageUrl: null, imageWidth: null, imageHeight: null });
    });

    it("foto: guarda las medidas y avisa si es de baja resolución", async () => {
        const png = await sharp({ create: { width: 320, height: 240, channels: 3, background: "#fff" } }).png().toBuffer();
        vi.mocked(fetch).mockResolvedValueOnce(new Response(new Uint8Array(png), { headers: { "content-type": "image/png" } }));
        put.mockResolvedValue({ url: "https://abc.public.blob.vercel-storage.com/products/a.png" });
        const [r] = await run({ op: "create", data: { ...newItem, imageUrl: "https://prov/a.png" } });
        expect(r).toMatchObject({ status: "created", warning: "foto de baja resolución (320x240)" });
        expect(db.product.create.mock.calls[0][0].data).toMatchObject({ imageWidth: 320, imageHeight: 240, supplier: "lococo" });
    });

    it("foto: la sube al storage; si falla crea igual con warning; misma foto de origen no se baja", async () => {
        const png = await sharp({ create: { width: 800, height: 600, channels: 3, background: "#fff" } }).png().toBuffer();
        const ok = new Response(new Uint8Array(png), { headers: { "content-type": "image/jpeg" } });
        vi.mocked(fetch).mockResolvedValueOnce(ok).mockResolvedValueOnce(new Response("x", { status: 404 }));
        put.mockResolvedValue({ url: "https://abc.public.blob.vercel-storage.com/products/a.jpg" });
        db.product.findMany.mockResolvedValue([row({ sourceImageUrl: "https://prov/same.jpg" })]);

        const [a, b, c] = await run(
            { op: "create", data: { ...newItem, imageUrl: "https://prov/a.jpg" } },
            { op: "create", data: { ...newItem, model: "OTRO", imageUrl: "https://prov/b.jpg" } },
            { op: "update", match: { id: "p1" }, data: { imageUrl: "https://prov/same.jpg" } },
        );
        expect(db.product.create.mock.calls[0][0].data).toMatchObject({
            imageUrl: "https://abc.public.blob.vercel-storage.com/products/a.jpg", sourceImageUrl: "https://prov/a.jpg",
        });
        expect(a).toEqual({ index: 0, id: "new", model: "DS-2CD", status: "created" });
        expect(b).toMatchObject({ status: "created", warning: expect.stringMatching(/foto.*404/) });
        expect(db.product.create.mock.calls[1][0].data.imageUrl).toBeUndefined();
        expect(c.status).toBe("unchanged");
        expect(fetch).toHaveBeenCalledTimes(2);
    });
});
