import { describe, it, expect } from "vitest";
import { cn, fmtUsd, safeRedirect } from "@/lib/utils";

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

describe("fmtUsd", () => {
    it("muestra centavos debajo de 100 y miles con punto arriba", () => {
        expect(fmtUsd(12.5)).toBe("US$ 12,50");
        expect(fmtUsd(1234.4)).toBe("US$ 1.234");
    });
});

import { jsonLdHtml } from "@/lib/utils";

describe("jsonLdHtml", () => {
    it("un </script> en el texto no cierra el bloque y el JSON sigue siendo el mismo", () => {
        const data = { description: "lente </script><script>alert(1)</script>" };
        const html = jsonLdHtml(data);
        expect(html).not.toContain("<");
        expect(JSON.parse(html)).toEqual(data);
    });
});
