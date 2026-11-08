import { describe, it, expect, vi, beforeEach } from "vitest";
import { hash } from "bcryptjs";

const db = vi.hoisted(() => ({
    loginAttempt: { count: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
    storeCustomer: { findUnique: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-real-ip": "1.2.3.4" }) }));
vi.mock("@/lib/store-auth", () => ({ createStoreSession: vi.fn(), deleteStoreSession: vi.fn(), getStoreSession: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { clientIp, isLoginBlocked, MAX_FAILED_LOGINS } from "@/lib/login-rate-limit";
import { loginStoreCustomer } from "@/actions/store/auth.actions";
import { assertString } from "@/lib/validations/common";

const login = { email: "ana@x.com", password: "clave123" };

beforeEach(async () => {
    vi.clearAllMocks();
    db.loginAttempt.count.mockResolvedValue(0);
    db.storeCustomer.findUnique.mockResolvedValue({ id: "c1", name: "Ana", email: "ana@x.com", passwordHash: await hash("clave123", 4) });
});

describe("rate limit de login", () => {
    it("toma la IP de x-real-ip, si no del primer x-forwarded-for", () => {
        expect(clientIp(new Headers({ "x-real-ip": "9.9.9.9", "x-forwarded-for": "1.1.1.1" }))).toBe("9.9.9.9");
        expect(clientIp(new Headers({ "x-forwarded-for": "1.1.1.1, 10.0.0.1" }))).toBe("1.1.1.1");
    });

    it("bloquea al llegar a MAX_FAILED_LOGINS fallos", async () => {
        db.loginAttempt.count.mockResolvedValue(MAX_FAILED_LOGINS - 1);
        expect(await isLoginBlocked("store", "1.2.3.4")).toBe(false);
        db.loginAttempt.count.mockResolvedValue(MAX_FAILED_LOGINS);
        expect(await isLoginBlocked("store", "1.2.3.4")).toBe(true);
    });

    it("IP bloqueada: rechaza aunque la contraseña sea correcta y no consulta al usuario", async () => {
        db.loginAttempt.count.mockResolvedValue(MAX_FAILED_LOGINS);
        const r = await loginStoreCustomer(login);
        expect("error" in r && r.error).toMatch(/Demasiados intentos/);
        expect(db.storeCustomer.findUnique).not.toHaveBeenCalled();
    });

    it("registra el fallo con contraseña incorrecta y limpia al acertar", async () => {
        await loginStoreCustomer({ ...login, password: "mala" });
        expect(db.loginAttempt.create).toHaveBeenCalledWith({ data: { ip: "1.2.3.4", scope: "store" } });
        expect(await loginStoreCustomer(login)).toEqual({ redirectTo: "/" });
        expect(db.loginAttempt.deleteMany).toHaveBeenCalledWith({ where: { ip: "1.2.3.4", scope: "store" } });
    });

    it("un objeto en lugar de email no llega a Prisma", async () => {
        await loginStoreCustomer({ email: { not: "" }, password: "x" } as never);
        expect(db.storeCustomer.findUnique).not.toHaveBeenCalled();
    });
});

describe("assertString", () => {
    it("rechaza objetos, vacíos y strings largos", () => {
        expect(assertString("abc")).toBe("abc");
        for (const bad of [{ not: "" }, "", "x".repeat(101), 5, null]) expect(() => assertString(bad)).toThrow("Parámetro inválido");
    });
});
