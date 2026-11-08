import { describe, it, expect } from "vitest";
import { metaDescription, productJsonLd } from "@/lib/seo";

describe("metaDescription", () => {
    it("deja igual un texto corto y colapsa espacios", () => {
        expect(metaDescription("Cámara  IP\n4MP")).toBe("Cámara IP 4MP");
    });
    it("corta en palabra completa con elipsis", () => {
        const out = metaDescription("palabra ".repeat(40));
        expect(out.length).toBeLessThanOrEqual(156);
        expect(out.endsWith("palabra…")).toBe(true);
    });
});

describe("productJsonLd", () => {
    it("arma Product con oferta, devolución y breadcrumb", () => {
        const ld = productJsonLd({
            name: "Cámara", description: null, imageUrl: null, sku: "CAM-1", priceArs: 1000,
            path: "/products/abc", availability: "MadeToOrder", breadcrumb: { name: "Catálogo", path: "/catalog" },
        });
        const [product, crumbs] = ld["@graph"] as [any, any]; // eslint-disable-line @typescript-eslint/no-explicit-any
        expect(product.offers.availability).toBe("https://schema.org/MadeToOrder");
        expect(product.offers.url).toMatch(/\/products\/abc$/);
        expect(product.offers.hasMerchantReturnPolicy.merchantReturnDays).toBe(10);
        expect(crumbs.itemListElement).toHaveLength(3);
    });
});
