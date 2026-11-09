import { LEGAL } from "@/lib/store-contact";

export const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL ?? "https://projaska.com").replace(/\/$/, "");

/** Meta description: una línea, cortada en palabra completa a ~155 caracteres (lo que Google muestra). */
export function metaDescription(text: string, max = 155): string {
    const clean = text.replace(/\s+/g, " ").trim();
    if (clean.length <= max) return clean;
    return clean.slice(0, clean.lastIndexOf(" ", max - 1)).replace(/[.,;:\-–—]+$/, "") + "…";
}

type Sellable = {
    name: string;
    description: string | null;
    imageUrl: string | null;
    sku: string;
    brand?: string | null;
    priceArs: number;
    path: string;
    availability: "InStock" | "OutOfStock" | "MadeToOrder";
    breadcrumb: { name: string; path: string };
};

/** Product + BreadcrumbList con los campos que Google pide para resultados de comercio. */
export function productJsonLd(p: Sellable) {
    const url = `${SITE_URL}${p.path}`;
    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Product",
                "@id": `${url}#product`,
                name: p.name,
                description: p.description ?? undefined,
                image: p.imageUrl ?? undefined,
                sku: p.sku,
                ...(p.brand && { brand: { "@type": "Brand", name: p.brand } }),
                url,
                offers: {
                    "@type": "Offer",
                    url,
                    priceCurrency: "ARS",
                    price: p.priceArs,
                    itemCondition: "https://schema.org/NewCondition",
                    availability: `https://schema.org/${p.availability}`,
                    seller: { "@id": `${SITE_URL}/#organization` },
                    // Botón de arrepentimiento: 10 días, la devolución corre por cuenta de la tienda (ver /terms).
                    hasMerchantReturnPolicy: {
                        "@type": "MerchantReturnPolicy",
                        applicableCountry: "AR",
                        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                        merchantReturnDays: 10,
                        returnMethod: "https://schema.org/ReturnByMail",
                        returnFees: "https://schema.org/FreeReturn",
                    },
                },
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
                    { "@type": "ListItem", position: 2, name: p.breadcrumb.name, item: `${SITE_URL}${p.breadcrumb.path}` },
                    { "@type": "ListItem", position: 3, name: p.name, item: url },
                ],
            },
        ],
    };
}

export const siteJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            "@id": `${SITE_URL}/#organization`,
            name: "Projaska",
            url: SITE_URL,
            logo: `${SITE_URL}/icon-512.png`,
            description: "Tienda online de cámaras de seguridad, alarmas, cerraduras inteligentes y kits, con asesoramiento técnico e instalación.",
            email: LEGAL.email,
            areaServed: { "@type": "Country", name: "Argentina" },
            contactPoint: { "@type": "ContactPoint", contactType: "customer service", email: LEGAL.email, availableLanguage: "es" },
        },
        {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            name: "Projaska",
            url: SITE_URL,
            inLanguage: "es-AR",
            publisher: { "@id": `${SITE_URL}/#organization` },
        },
    ],
};
