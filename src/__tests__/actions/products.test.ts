import { describe, it, expect, vi, beforeEach } from "vitest";

const db = vi.hoisted(() => ({ product: { update: vi.fn() } }));
const role = vi.hoisted(() => ({ requireRole: vi.fn(async () => ({ user: { id: "u1", role: "ADMIN" } })) }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("@/lib/require-role", () => role);
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { setProductShowInStore } from "@/actions/products";

beforeEach(() => vi.clearAllMocks());

describe("setProductShowInStore", () => {
    it("actualiza solo showInStore de un producto no borrado", async () => {
        await setProductShowInStore("p1", false);
        expect(role.requireRole).toHaveBeenCalledWith("ADMIN", "SELLER");
        expect(db.product.update).toHaveBeenCalledWith({ where: { id: "p1", deletedAt: null }, data: { showInStore: false } });
    });

    it("rechaza valores que no son booleanos sin tocar la base", async () => {
        await expect(setProductShowInStore("p1", "false" as unknown as boolean)).rejects.toThrow();
        await expect(setProductShowInStore({ not: "x" } as unknown as string, true)).rejects.toThrow();
        expect(db.product.update).not.toHaveBeenCalled();
    });

    it("no actualiza si el rol no tiene permiso", async () => {
        role.requireRole.mockRejectedValueOnce(new Error("Unauthorized"));
        await expect(setProductShowInStore("p1", true)).rejects.toThrow();
        expect(db.product.update).not.toHaveBeenCalled();
    });
});
