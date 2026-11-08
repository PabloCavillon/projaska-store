import { describe, it, expect } from "vitest";
import { cn, safeRedirect } from "@/lib/utils";

describe("cn", () => {
    it("combina clases simples", () => {
        expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("resuelve conflictos de Tailwind (la última clase gana)", () => {
        expect(cn("p-2", "p-4")).toBe("p-4");
        expect(cn("text-sm", "text-lg")).toBe("text-lg");
    });

    it("ignora valores falsy", () => {
        expect(cn("foo", false, undefined, null, "bar")).toBe("foo bar");
    });

    it("soporta objetos condicionales", () => {
        expect(cn({ "font-bold": true, "text-red-500": false })).toBe("font-bold");
    });

    it("soporta arrays", () => {
        expect(cn(["foo", "bar"])).toBe("foo bar");
    });

    it("devuelve string vacío sin argumentos", () => {
        expect(cn()).toBe("");
    });

    it("fusiona modificadores de Tailwind correctamente", () => {
        expect(cn("hover:bg-red-500", "hover:bg-blue-500")).toBe("hover:bg-blue-500");
    });
});

describe("safeRedirect", () => {
    it("acepta rutas internas", () => {
        expect(safeRedirect("/checkout")).toBe("/checkout");
    });
    it("rechaza dominios externos y vacíos", () => {
        for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "", undefined, "checkout"]) {
            expect(safeRedirect(bad)).toBe("/");
        }
    });
});
