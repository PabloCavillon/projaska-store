import { describe, it, expect, vi, beforeEach } from "vitest";

const db = vi.hoisted(() => ({
    product: { findMany: vi.fn(), update: vi.fn() },
    kit: { findMany: vi.fn() },
    storeCustomer: { findUnique: vi.fn() },
    storeOrder: { create: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn(), update: vi.fn() },
    stockMovement: { create: vi.fn() },
    kitItem: { findMany: vi.fn() },
    $transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("@/lib/store-auth", () => ({ getStoreSession: async () => ({ id: "c1", name: "Ana", email: "ana@x.com" }) }));
vi.mock("@/actions/config", () => ({
    getPriceConfig: async () => ({
        dollarRate: 1000, shippingPct: 0, profitPct: 0,
        guildDiscountPct: 0, volumeDiscountPct: 0, volumeThresholdArs: 1e12,
    }),
}));
vi.mock("@/lib/require-role", () => ({ requireRole: async () => ({ user: { id: "u1", role: "ADMIN" } }) }));
vi.mock("@/auth", () => ({ auth: async () => null }));
vi.mock("@/lib/web-push", () => ({ sendPushToAdminsAndSellers: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/server", () => ({ after: vi.fn() }));

import { createStoreOrder, updateStoreOrderStatusAdmin } from "@/actions/store/store-orders.actions";

beforeEach(() => {
    vi.clearAllMocks();
    db.kit.findMany.mockResolvedValue([]);
    db.storeCustomer.findUnique.mockResolvedValue(null);
    db.storeOrder.create.mockResolvedValue({ id: "o1" });
    db.product.findMany.mockResolvedValue([
        { id: "p1", price: 10, unitsPerBox: 12, offerDiscountPct: null, offerUnit: null },
    ]);
});

describe("createStoreOrder", () => {
    it("cobra la caja entera y guarda unidad + caja del mismo producto como una línea en unidades", async () => {
        const res = await createStoreOrder([
            { productId: "p1", quantity: 2, unit: "box" },  // 24 u · USD 240
            { productId: "p1", quantity: 3, unit: "unit" }, //  3 u · USD 30
        ]);
        expect(res).toEqual({ code: expect.stringMatching(/^STR-/) });

        const data = db.storeOrder.create.mock.calls[0][0].data;
        expect(data.subtotalUsd).toBe(270);
        expect(data.items.create).toEqual([{ productId: "p1", quantity: 27, unitPriceUsd: 10 }]);
    });

    it("la oferta por caja descuenta sobre la caja", async () => {
        db.product.findMany.mockResolvedValue([
            { id: "p1", price: 10, unitsPerBox: 12, offerDiscountPct: 10, offerUnit: "box" },
        ]);
        await createStoreOrder([{ productId: "p1", quantity: 1, unit: "box" }]);
        expect(db.storeOrder.create.mock.calls[0][0].data.subtotalUsd).toBeCloseTo(108);
    });

    it("rechaza cantidades negativas o con decimales sin crear nada", async () => {
        for (const quantity of [-50, 0, 1.5]) {
            const res = await createStoreOrder([{ productId: "p1", quantity, unit: "unit" }]);
            expect(res).toHaveProperty("error");
        }
        expect(db.storeOrder.create).not.toHaveBeenCalled();
    });
});

describe("updateStoreOrderStatusAdmin", () => {
    it("una segunda confirmación no vuelve a descontar stock", async () => {
        db.storeOrder.findUnique.mockResolvedValue({
            id: "o1", status: "PENDING",
            items: [{ productId: "p1", kitId: null, quantity: 5, product: { isMadeToOrder: false } }],
        });
        db.$transaction.mockImplementation(async (fn: (tx: typeof db) => unknown) => fn(db));
        db.storeOrder.updateMany.mockResolvedValue({ count: 0 }); // otro clic ya la confirmó

        await updateStoreOrderStatusAdmin("o1", "CONFIRMED" as never);
        expect(db.product.update).not.toHaveBeenCalled();
        expect(db.stockMovement.create).not.toHaveBeenCalled();
    });
});
