import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validations/store-auth";
import { productSchema } from "@/lib/validations/product";
import { orderSchema } from "@/lib/validations/order";
import { kitSchema } from "@/lib/validations/kit";

// ── store-auth ──────────────────────────────────────────────────────────────

describe("loginSchema", () => {
    it("acepta datos válidos", () => {
        const result = loginSchema.safeParse({ email: "a@b.com", password: "secret" });
        expect(result.success).toBe(true);
    });

    it("rechaza email inválido", () => {
        const result = loginSchema.safeParse({ email: "no-es-email", password: "secret" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("email");
    });

    it("rechaza contraseña vacía", () => {
        const result = loginSchema.safeParse({ email: "a@b.com", password: "" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("password");
    });

    it("acepta redirect opcional", () => {
        const result = loginSchema.safeParse({ email: "a@b.com", password: "x", redirect: "/checkout" });
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.redirect).toBe("/checkout");
    });
});

describe("registerSchema", () => {
    const valid = {
        name: "Juan Pérez",
        email: "juan@test.com",
        password: "password123",
        confirmPassword: "password123",
    };

    it("acepta datos válidos", () => {
        expect(registerSchema.safeParse(valid).success).toBe(true);
    });

    it("rechaza nombre muy corto", () => {
        const result = registerSchema.safeParse({ ...valid, name: "J" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("name");
    });

    it("rechaza contraseña de menos de 8 caracteres", () => {
        const result = registerSchema.safeParse({ ...valid, password: "short", confirmPassword: "short" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("password");
    });

    it("rechaza contraseñas que no coinciden", () => {
        const result = registerSchema.safeParse({ ...valid, confirmPassword: "diferente" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("confirmPassword");
        expect(result.error?.issues[0].message).toMatch(/no coinciden/i);
    });

    it("acepta teléfono opcional", () => {
        const result = registerSchema.safeParse({ ...valid, phone: "1234567890" });
        expect(result.success).toBe(true);
    });
});

// ── product ─────────────────────────────────────────────────────────────────

describe("productSchema", () => {
    const valid = { sku: "SKU001", name: "Producto", price: "99.99", stock: "10", category: "Cat A" };

    it("acepta datos válidos y convierte strings a números", () => {
        const result = productSchema.safeParse(valid);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.price).toBe(99.99);
            expect(result.data.stock).toBe(10);
        }
    });

    it("model es opcional: vacío o ausente queda null, con valor se recorta", () => {
        expect(productSchema.parse(valid).model).toBeNull();
        expect(productSchema.parse({ ...valid, model: "  " }).model).toBeNull();
        expect(productSchema.parse({ ...valid, model: " HAC-B1A21P " }).model).toBe("HAC-B1A21P");
        expect(productSchema.parse({ ...valid, brand: "" }).brand).toBeNull();
        expect(productSchema.parse({ ...valid, brand: " Dahua " }).brand).toBe("Dahua");
    });

    it("rechaza precio negativo o cero", () => {
        expect(productSchema.safeParse({ ...valid, price: "0" }).success).toBe(false);
        expect(productSchema.safeParse({ ...valid, price: "-5" }).success).toBe(false);
    });

    it("rechaza stock negativo", () => {
        const result = productSchema.safeParse({ ...valid, stock: "-1" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("stock");
    });

    it("rechaza stock con decimales", () => {
        const result = productSchema.safeParse({ ...valid, stock: "1.5" });
        expect(result.success).toBe(false);
    });

    it("rechaza SKU vacío", () => {
        expect(productSchema.safeParse({ ...valid, sku: "" }).success).toBe(false);
    });

    it("acepta stock en 0", () => {
        expect(productSchema.safeParse({ ...valid, stock: "0" }).success).toBe(true);
    });
});

// ── order ────────────────────────────────────────────────────────────────────

describe("orderSchema", () => {
    const validItem = { productId: "prod-1", quantity: "2", unitPrice: "100" };
    const valid = { customerId: "cust-1", items: [validItem] };

    it("acepta una orden válida", () => {
        expect(orderSchema.safeParse(valid).success).toBe(true);
    });

    it("rechaza sin customerId", () => {
        const result = orderSchema.safeParse({ ...valid, customerId: "" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("customerId");
    });

    it("rechaza items vacíos", () => {
        const result = orderSchema.safeParse({ ...valid, items: [] });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("items");
    });

    it("rechaza cantidad 0 en un ítem", () => {
        const result = orderSchema.safeParse({ ...valid, items: [{ ...validItem, quantity: "0" }] });
        expect(result.success).toBe(false);
    });

    it("acepta notas opcionales", () => {
        const result = orderSchema.safeParse({ ...valid, notes: "Entregar a la tarde" });
        expect(result.success).toBe(true);
    });
});

// ── kit ──────────────────────────────────────────────────────────────────────

describe("kitSchema", () => {
    const validItem = { productId: "prod-1", quantity: "1" };
    const valid = {
        sku: "KIT001",
        name: "Kit de prueba",
        price: "500",
        isActive: true,
        items: [validItem],
    };

    it("acepta un kit válido", () => {
        expect(kitSchema.safeParse(valid).success).toBe(true);
    });

    it("rechaza ítem sin productId ni childKitId", () => {
        const result = kitSchema.safeParse({ ...valid, items: [{ quantity: "1" }] });
        expect(result.success).toBe(false);
    });

    it("acepta ítem con childKitId en lugar de productId", () => {
        const result = kitSchema.safeParse({
            ...valid,
            items: [{ childKitId: "kit-2", quantity: "1" }],
        });
        expect(result.success).toBe(true);
    });

    it("rechaza kit sin ítems", () => {
        const result = kitSchema.safeParse({ ...valid, items: [] });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain("items");
    });

    it("rechaza precio cero o negativo", () => {
        expect(kitSchema.safeParse({ ...valid, price: "0" }).success).toBe(false);
        expect(kitSchema.safeParse({ ...valid, price: "-1" }).success).toBe(false);
    });

    it("rechaza cantidad de ítem menor a 1", () => {
        const result = kitSchema.safeParse({ ...valid, items: [{ productId: "p1", quantity: "0" }] });
        expect(result.success).toBe(false);
    });
});

describe("trim en formularios del admin", () => {
    it("recorta espacios antes y después", () => {
        const p = productSchema.parse({ sku: " SKU1 ", name: "  Cámara IP  ", price: "1", stock: "0", category: " CCTV " });
        expect([p.sku, p.name, p.category]).toEqual(["SKU1", "Cámara IP", "CCTV"]);
    });
    it("un campo obligatorio con solo espacios es inválido", () => {
        expect(productSchema.safeParse({ sku: "S", name: "   ", price: "1", stock: "0", category: "C" }).success).toBe(false);
    });
    it("email de cliente: espacios → vacío permitido; con valor se recorta", async () => {
        const { customerSchema } = await import("@/lib/validations/customer");
        expect(customerSchema.parse({ name: "Ana", email: "   " }).email).toBe("");
        expect(customerSchema.parse({ name: "Ana", email: " ana@x.com " }).email).toBe("ana@x.com");
        expect(customerSchema.safeParse({ name: "Ana", email: "no-es-mail" }).success).toBe(false);
    });
});
