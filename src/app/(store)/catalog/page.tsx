import { getStoreProducts } from "@/actions/store/products.actions";
import { getStoreKits } from "@/actions/store/kits.actions";
import { Catalog } from "@/components/store/catalog";

export const metadata = {
    title: "Catálogo",
    description: "Catálogo completo de tecnología y seguridad: cámaras, alarmas, cerraduras inteligentes, domótica, kits y accesorios. Precios en pesos argentinos.",
    openGraph: {
        title: "Catálogo | Projaska",
        description: "Cámaras, alarmas, cerraduras, kits armados y accesorios con stock real.",
        url: "/catalog",
    },
    alternates: { canonical: "/catalog" },
};

export default async function CatalogPage() {
    const [{ products, config }, { kits }] = await Promise.all([getStoreProducts(), getStoreKits()]);

    if (!config) {
        return (
            <div className="border border-hud-line flex flex-col items-center justify-center py-32 px-6 text-center gap-3">
                <p className="osd text-caution text-sm">Señal no disponible</p>
                <p className="text-xl">La tienda está en mantenimiento.</p>
                <p className="text-sm text-osd-dim">Volvé en unos minutos, estamos actualizando los precios.</p>
            </div>
        );
    }

    const pad = (n: number) => String(n).padStart(2, "0");

    return (
        <div className="space-y-8 sm:space-y-10">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <h1 className="osd text-4xl sm:text-5xl">Catálogo</h1>
                <p className="osd text-sm text-osd-dim tabular-nums">
                    {pad(products.length)} productos · {pad(kits.length)} kits
                </p>
            </div>
            <div id="catalogo" className="scroll-mt-16 space-y-10 sm:space-y-14">
                <Catalog products={products} kits={kits} />
            </div>
        </div>
    );
}
