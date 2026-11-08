import { getStoreProducts } from "@/actions/store/products.actions";
import { getStoreKits } from "@/actions/store/kits.actions";
import { StoreHome } from "@/components/store/store-home";

export const metadata = {
    title: "Catálogo de Productos",
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
    const [{ products, config }, { kits }] = await Promise.all([
        getStoreProducts(),
        getStoreKits(),
    ]);

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
            <StoreHome products={products} kits={kits} dollarRate={config.dollarRate} />
        </>
    );
}
