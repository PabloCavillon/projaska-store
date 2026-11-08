import { getBestSellerIds, getStoreProducts } from "@/actions/store/products.actions";
import { getStoreKits } from "@/actions/store/kits.actions";
import { StoreHome } from "@/components/store/store-home";

export const metadata = {
    title: "Tecnología y seguridad",
    description: "Explorá nuestro catálogo de tecnología y seguridad: cámaras, alarmas, cerraduras inteligentes, domótica y accesorios. Precios en pesos argentinos.",
    openGraph: {
        title: "Catálogo | Projaska",
        description: "Tecnología y seguridad para profesionales. Cámaras, alarmas, cerraduras y más.",
        url: "/",
    },
    alternates: { canonical: "/" },
};

const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Projaska",
    url: process.env.NEXT_PUBLIC_BASE_URL ?? "https://projaska.com",
    logo: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://projaska.com"}/icon-512.png`,
    description: "Tienda online de tecnología y seguridad para profesionales.",
    sameAs: [],
};

export default async function StorePage() {
    const [{ products, config }, { kits }, bestSellerIds] = await Promise.all([
        getStoreProducts(),
        getStoreKits(),
        getBestSellerIds(10),
    ]);

    // Más vendidos que siguen publicados, en orden de ventas. Sin ventas todavía: los que tienen stock.
    const byId = new Map(products.map((p) => [p.id, p]));
    const sold = bestSellerIds.flatMap((id) => byId.get(id) ?? []);
    const bestSellers = sold.length > 0 ? sold : products.filter((p) => p.stock > 0).slice(0, 10);

    if (!config) {
        return (
            <div className="border border-hud-line flex flex-col items-center justify-center py-32 px-6 text-center gap-3">
                <p className="osd text-caution text-sm">Señal no disponible</p>
                <p className="text-xl">La tienda está en mantenimiento.</p>
                <p className="text-sm text-osd-dim">Volvé en unos minutos, estamos actualizando los precios.</p>
            </div>
        );
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
            />
            <StoreHome
                products={products}
                kits={kits}
                bestSellers={bestSellers}
                bestSellersAreSales={sold.length > 0}
                dollarRate={config.dollarRate}
            />
        </>
    );
}
