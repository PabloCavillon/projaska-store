'use client';

import type { StoreProduct } from "@/actions/store/products.actions";
import type { StoreKit } from "@/actions/store/kits.actions";
import { ProductCard } from "@/components/store/product-card";
import { KitCard } from "@/components/store/kit-card";
import { ChannelBar, type Channel } from "@/components/store/channel-bar";
import { whatsappUrl } from "@/lib/store-contact";
import { matches } from "@/lib/search";
import { ArrowRight } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");
const grid = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3";

export function Catalog({ products, kits }: { products: StoreProduct[]; kits: StoreKit[] }) {
    const [query, setQuery] = useState("");
    const q = useDeferredValue(query).trim();

    // Al empezar a buscar, llevar la vista al inicio del catálogo: los resultados reemplazan las secciones
    const onQuery = (v: string) => {
        if (!query.trim() && v.trim()) document.getElementById("catalogo")?.scrollIntoView({ block: "start" });
        setQuery(v);
    };

    const categories = useMemo(() => [...new Set(products.map((p) => p.category))].sort(), [products]);
    const channels: Channel[] = useMemo(() => [
        ...(kits.length > 0 ? [{ id: "ch-kits", label: "Kits" }] : []),
        ...categories.map((c, i) => ({ id: `ch-${i + 1}`, label: c })),
    ], [kits.length, categories]);

    const hits = useMemo(() => q ? {
        kits: kits.filter((k) => matches(q, k.name, k.sku, "kit")),
        products: products.filter((p) => matches(q, p.name, p.sku, p.category)),
    } : null, [q, kits, products]);

    return (
        <>
            {(channels.length > 0 || products.length > 0) && (
                <ChannelBar channels={channels} query={query} onQuery={onQuery} resultCount={hits ? hits.kits.length + hits.products.length : null} />
            )}

            {hits ? (
                <section aria-live="polite" className="space-y-5 min-h-[50vh]">
                    <SectionHead label={`Resultados: “${q}”`} count={hits.kits.length + hits.products.length} />
                    {hits.kits.length + hits.products.length === 0 ? (
                        <div className="border border-hud-line flex flex-col items-center justify-center py-20 px-6 text-center gap-4">
                            <p>No encontramos nada con “{q}”.</p>
                            <p className="text-sm text-osd-dim max-w-[46ch]">Probá con otra palabra o con el SKU. Si no lo tenemos publicado, preguntanos: muchas veces lo conseguimos.</p>
                            <a
                                href={whatsappUrl(`Hola! Busco: ${q}`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="osd text-xs text-pj-ink hover:text-osd inline-flex items-center gap-2 min-h-11"
                            >
                                Consultar por WhatsApp <ArrowRight size={14} aria-hidden="true" />
                            </a>
                        </div>
                    ) : (
                        <div className={grid}>
                            {hits.kits.map((kit) => <KitCard key={kit.id} kit={kit} />)}
                            {hits.products.map((product) => <ProductCard key={product.id} product={product} />)}
                        </div>
                    )}
                </section>
            ) : (
                <>
                    {kits.length > 0 && (
                        <section id="ch-kits" className="scroll-mt-32 space-y-5">
                            <SectionHead index={1} label="Kits" count={kits.length} />
                            <div className={grid}>
                                {kits.map((kit) => <KitCard key={kit.id} kit={kit} />)}
                            </div>
                        </section>
                    )}

                    {products.length === 0 ? (
                        <div className="border border-hud-line flex flex-col items-center justify-center py-24 text-center gap-2">
                            <p className="osd text-osd-dim text-sm">Sin señal</p>
                            <p>No hay productos disponibles por el momento.</p>
                        </div>
                    ) : (
                        categories.map((category, i) => {
                            const catProducts = products.filter((p) => p.category === category);
                            return (
                                <section key={category} id={`ch-${i + 1}`} className="scroll-mt-32 space-y-5">
                                    <SectionHead index={i + 1 + (kits.length > 0 ? 1 : 0)} label={category} count={catProducts.length} />
                                    <div className={grid}>
                                        {catProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                                    </div>
                                </section>
                            );
                        })
                    )}
                </>
            )}
        </>
    );
}

function SectionHead({ index, label, count }: { index?: number; label: string; count: number }) {
    return (
        <div className="flex items-baseline justify-between gap-4 border-b border-hud-line pb-3">
            <h2 className="osd text-2xl sm:text-3xl min-w-0 break-words">
                {index !== undefined && <span className="text-osd-dim mr-3 text-base sm:text-lg align-middle">CH{pad(index)}</span>}
                {label}
            </h2>
            <span className="osd text-xs text-osd-dim tabular-nums shrink-0">{pad(count)} items</span>
        </div>
    );
}
