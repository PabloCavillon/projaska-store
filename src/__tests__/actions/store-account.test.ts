import { describe, it, expect, vi, beforeEach } from "vitest";
import { hash } from "bcryptjs";

const db = vi.hoisted(() => ({
    storeCustomer: { findUnique: vi.fn(), update: vi.fn() },
    storeOrder: { count: vi.fn(), findUnique: vi.fn() },
    revocationRequest: { create: vi.fn() },
}));
const auth = vi.hoisted(() => ({ deleteStoreSession: vi.fn(), session: { id: "c1", name: "Ana", email: "ana@x.com" } as unknown }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("@/lib/store-auth", () => ({
    getStoreSession: async () => auth.session,
    createStoreSession: vi.fn(),
    deleteStoreSession: auth.deleteStoreSession,
}));
vi.mock("@/lib/web-push", () => ({ sendPushToAdminsAndSellers: vi.fn(async () => {}) }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { deleteStoreAccount } from "@/actions/store/auth.actions";
import { createRevocationRequest } from "@/actions/store/revocation.actions";

beforeEach(async () => {
    vi.clearAllMocks();
    db.storeCustomer.findUnique.mockResolvedValue({ id: "c1abcdef-xx", passwordHash: await hash("clave123", 4) });
    db.storeOrder.count.mockResolvedValue(0);
});

describe("deleteStoreAccount", () => {
    it("rechaza contraseña incorrecta sin tocar nada", async () => {
        expect(await deleteStoreAccount("otra")).toEqual({ error: "La contraseña no es correcta." });
        expect(db.storeCustomer.update).not.toHaveBeenCalled();
    });

    it("bloquea la baja con pedidos en curso", async () => {
        db.storeOrder.count.mockResolvedValue(2);
        const r = await deleteStoreAccount("clave123");
        expect("error" in r && r.error).toMatch(/2 pedidos en curso/);
        expect(db.storeCustomer.update).not.toHaveBeenCalled();
    });

    it("anonimiza la cuenta, cierra sesión y devuelve código", async () => {
        expect(await deleteStoreAccount("clave123")).toEqual({ code: "BAJA-C1ABCDEF" });
        const data = db.storeCustomer.update.mock.calls[0][0].data;
        expect(data).toMatchObject({ email: "baja-c1abcdef-xx@projaska.invalid", phone: null, address: null, customerId: null, passwordHash: "" });
        expect(data.deletedAt).toBeInstanceOf(Date);
        expect(auth.deleteStoreSession).toHaveBeenCalled();
    });
});

describe("createRevocationRequest", () => {
    const body = { orderCode: "str-abc", name: "Ana", email: "ANA@x.com" };

    it("404 lógico si el pedido no existe", async () => {
        db.storeOrder.findUnique.mockResolvedValue(null);
        const r = await createRevocationRequest(body);
        expect("error" in r && r.error).toMatch(/STR-ABC/);
        expect(db.revocationRequest.create).not.toHaveBeenCalled();
    });

    it("guarda la solicitud y devuelve código ARR-", async () => {
        db.storeOrder.findUnique.mockResolvedValue({ id: "o1" });
        const r = await createRevocationRequest(body);
        expect("code" in r && r.code).toMatch(/^ARR-[A-Z0-9]{8}$/);
        expect(db.revocationRequest.create.mock.calls[0][0].data).toMatchObject({ orderCode: "STR-ABC", email: "ana@x.com", phone: null });
    });
});
