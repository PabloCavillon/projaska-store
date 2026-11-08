import { describe, it, expect } from "vitest";
import { customerSchema } from "@/lib/validations/customer";
import { expenseSchema } from "@/lib/validations/expense";
import { stockMovementSchema } from "@/lib/validations/stock";
import { userSchema, createUserSchema } from "@/lib/validations/user";
import { priceConfigSchema } from "@/lib/validations/config";

// ── customerSchema ────────────────────────────────────────────────────────────

describe("customerSchema", () => {
    const valid = { name: "Juan Pérez" };

    it("acepta nombre solo", () => {
        expect(customerSchema.safeParse(valid).success).toBe(true);
    });

    it("rechaza nombre vacío", () => {
        const result = customerSchema.safeParse({ name: "" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("name");
    });

    it("acepta email válido", () => {
        expect(customerSchema.safeParse({ ...valid, email: "a@b.com" }).success).toBe(true);
    });

    it("rechaza email inválido", () => {
        const result = customerSchema.safeParse({ ...valid, email: "no-es-email" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("email");
    });

    it("acepta email vacío (campo opcional vacío)", () => {
        expect(customerSchema.safeParse({ ...valid, email: "" }).success).toBe(true);
    });

    it("isGuild es false por defecto", () => {
        const result = customerSchema.safeParse(valid);
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.isGuild).toBe(false);
    });

    it("acepta isGuild true", () => {
        const result = customerSchema.safeParse({ ...valid, isGuild: true });
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.isGuild).toBe(true);
    });

    it("acepta campos opcionales: phone, address, notes", () => {
        const result = customerSchema.safeParse({
            ...valid,
            phone: "261-000-0000",
            address: "Calle Falsa 123",
            notes: "Cliente frecuente",
        });
        expect(result.success).toBe(true);
    });
});

// ── expenseSchema ─────────────────────────────────────────────────────────────

describe("expenseSchema", () => {
    it("acepta gasto PURCHASE con amountUsd y cotización", () => {
        const result = expenseSchema.safeParse({
            type: "PURCHASE",
            description: "Compra de stock",
            amountUsd: 500,
            dollarRate: 1400,
            date: "2025-01-01",
        });
        expect(result.success).toBe(true);
    });

    it("rechaza PURCHASE sin cotización (sumaría $ 0 en pesos)", () => {
        const result = expenseSchema.safeParse({ type: "PURCHASE", description: "Compra", amountUsd: 500, date: "2025-01-01" });
        expect(result.success).toBe(false);
    });

    it("rechaza PURCHASE sin amountUsd", () => {
        const result = expenseSchema.safeParse({
            type: "PURCHASE",
            description: "Compra",
            date: "2025-01-01",
        });
        expect(result.success).toBe(false);
    });

    it("acepta SHIPPING con amountArs", () => {
        const result = expenseSchema.safeParse({
            type: "SHIPPING",
            description: "Flete",
            amountArs: 10000,
            date: "2025-01-01",
        });
        expect(result.success).toBe(true);
    });

    it("rechaza SHIPPING sin amountArs", () => {
        const result = expenseSchema.safeParse({
            type: "SHIPPING",
            description: "Flete",
            date: "2025-01-01",
        });
        expect(result.success).toBe(false);
    });

    it("acepta OTHER con amountArs", () => {
        expect(expenseSchema.safeParse({
            type: "OTHER",
            description: "Varios",
            amountArs: 500,
            date: "2025-01-01",
        }).success).toBe(true);
    });

    it("acepta ADVERTISING con amountArs", () => {
        expect(expenseSchema.safeParse({
            type: "ADVERTISING",
            description: "Publicidad",
            amountArs: 2000,
            date: "2025-01-01",
        }).success).toBe(true);
    });

    it("rechaza descripción vacía", () => {
        const result = expenseSchema.safeParse({
            type: "OTHER",
            description: "",
            amountArs: 500,
            date: "2025-01-01",
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("description");
    });

    it("rechaza fecha vacía", () => {
        const result = expenseSchema.safeParse({
            type: "OTHER",
            description: "Gasto",
            amountArs: 500,
            date: "",
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("date");
    });

    it("rechaza tipo inválido", () => {
        const result = expenseSchema.safeParse({
            type: "INVALID",
            description: "Gasto",
            amountArs: 500,
            date: "2025-01-01",
        });
        expect(result.success).toBe(false);
    });

    it("acepta amountUsd vacío como string (campo opcional de formulario)", () => {
        const result = expenseSchema.safeParse({
            type: "SHIPPING",
            description: "Flete",
            amountArs: 5000,
            amountUsd: "",
            date: "2025-01-01",
        });
        expect(result.success).toBe(true);
    });
});

// ── stockMovementSchema ───────────────────────────────────────────────────────

describe("stockMovementSchema", () => {
    const valid = { productId: "prod-1", type: "IN", quantity: "5" };

    it("acepta movimiento de entrada válido", () => {
        expect(stockMovementSchema.safeParse(valid).success).toBe(true);
    });

    it("acepta movimiento de salida válido", () => {
        expect(stockMovementSchema.safeParse({ ...valid, type: "OUT" }).success).toBe(true);
    });

    it("rechaza productId vacío", () => {
        const result = stockMovementSchema.safeParse({ ...valid, productId: "" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("productId");
    });

    it("rechaza cantidad 0", () => {
        const result = stockMovementSchema.safeParse({ ...valid, quantity: "0" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("quantity");
    });

    it("rechaza cantidad negativa", () => {
        expect(stockMovementSchema.safeParse({ ...valid, quantity: "-1" }).success).toBe(false);
    });

    it("rechaza cantidad decimal", () => {
        expect(stockMovementSchema.safeParse({ ...valid, quantity: "1.5" }).success).toBe(false);
    });

    it("rechaza tipo inválido", () => {
        expect(stockMovementSchema.safeParse({ ...valid, type: "TRANSFER" }).success).toBe(false);
    });

    it("convierte quantity de string a number", () => {
        const result = stockMovementSchema.safeParse(valid);
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.quantity).toBe(5);
    });

    it("acepta reason opcional", () => {
        expect(stockMovementSchema.safeParse({ ...valid, reason: "Ajuste inventario" }).success).toBe(true);
    });
});

// ── userSchema / createUserSchema ─────────────────────────────────────────────

describe("userSchema", () => {
    const valid = { username: "admin", role: "ADMIN" };

    it("acepta usuario válido sin contraseña (update)", () => {
        expect(userSchema.safeParse(valid).success).toBe(true);
    });

    it("acepta con contraseña", () => {
        expect(userSchema.safeParse({ ...valid, password: "secret123" }).success).toBe(true);
    });

    it("rechaza username menor a 3 caracteres", () => {
        const result = userSchema.safeParse({ ...valid, username: "ab" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("username");
    });

    it("rechaza role inválido", () => {
        expect(userSchema.safeParse({ ...valid, role: "SUPERADMIN" }).success).toBe(false);
    });

    it("acepta todos los roles válidos", () => {
        for (const role of ["ADMIN", "SELLER", "WAREHOUSE", "WATCHER"]) {
            expect(userSchema.safeParse({ ...valid, role }).success).toBe(true);
        }
    });

    it("acepta contraseña vacía en update (campo opcional)", () => {
        expect(userSchema.safeParse({ ...valid, password: "" }).success).toBe(true);
    });

    it("rechaza contraseña menor a 6 caracteres", () => {
        const result = userSchema.safeParse({ ...valid, password: "abc" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("password");
    });
});

describe("createUserSchema", () => {
    it("acepta usuario con contraseña en creación", () => {
        expect(createUserSchema.safeParse({ username: "newuser", role: "SELLER", password: "secret123" }).success).toBe(true);
    });

    it("rechaza creación sin contraseña", () => {
        const result = createUserSchema.safeParse({ username: "newuser", role: "SELLER" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("password");
    });

    it("rechaza creación con contraseña vacía", () => {
        const result = createUserSchema.safeParse({ username: "newuser", role: "SELLER", password: "" });
        expect(result.success).toBe(false);
    });
});

// ── priceConfigSchema ─────────────────────────────────────────────────────────

describe("priceConfigSchema", () => {
    const valid = {
        dollarRate: "1000",
        shippingPct: "10",
        profitPct: "20",
        guildDiscountPct: "5",
        volumeDiscountPct: "10",
        volumeThresholdArs: "50000",
    };

    it("acepta configuración válida y convierte strings a números", () => {
        const result = priceConfigSchema.safeParse(valid);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.dollarRate).toBe(1000);
            expect(result.data.shippingPct).toBe(10);
            expect(result.data.profitPct).toBe(20);
        }
    });

    it("rechaza cotización del dólar en 0", () => {
        expect(priceConfigSchema.safeParse({ ...valid, dollarRate: "0" }).success).toBe(false);
    });

    it("rechaza cotización negativa", () => {
        expect(priceConfigSchema.safeParse({ ...valid, dollarRate: "-1" }).success).toBe(false);
    });

    it("acepta porcentajes en 0", () => {
        expect(priceConfigSchema.safeParse({ ...valid, shippingPct: "0", profitPct: "0" }).success).toBe(true);
    });

    it("rechaza porcentaje mayor a 100", () => {
        expect(priceConfigSchema.safeParse({ ...valid, shippingPct: "101" }).success).toBe(false);
        expect(priceConfigSchema.safeParse({ ...valid, profitPct: "101" }).success).toBe(false);
        expect(priceConfigSchema.safeParse({ ...valid, guildDiscountPct: "101" }).success).toBe(false);
        expect(priceConfigSchema.safeParse({ ...valid, volumeDiscountPct: "101" }).success).toBe(false);
    });

    it("rechaza porcentaje negativo", () => {
        expect(priceConfigSchema.safeParse({ ...valid, shippingPct: "-1" }).success).toBe(false);
    });

    it("rechaza umbral de volumen en 0", () => {
        expect(priceConfigSchema.safeParse({ ...valid, volumeThresholdArs: "0" }).success).toBe(false);
    });

    it("acepta porcentajes en 100 (tope)", () => {
        expect(priceConfigSchema.safeParse({ ...valid, shippingPct: "100", profitPct: "100" }).success).toBe(true);
    });
});
