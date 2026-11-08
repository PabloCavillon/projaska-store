import { describe, it, expect } from "vitest";
import { matches, normalize } from "@/lib/search";

describe("búsqueda del catálogo", () => {
    it("ignora tildes y mayúsculas", () => {
        expect(normalize("Cámara DOMO")).toBe("camara domo");
        expect(matches("camara", "Cámara domo 2MP")).toBe(true);
    });
    it("encuentra por SKU", () => {
        expect(matches("cam-d2", "Cámara domo", "CAM-D2")).toBe(true);
    });
    it("exige todas las palabras", () => {
        expect(matches("domo 4mp", "Cámara domo 2MP")).toBe(false);
        expect(matches("domo 2mp", "Cámara domo 2MP")).toBe(true);
    });
});
