'use client';

import type { StoreProduct } from "@/actions/store/products.actions";
import type { StoreKit } from "@/actions/store/kits.actions";
import { ProductCard } from "@/components/store/product-card";
import { KitCard } from "@/components/store/kit-card";
import { ChannelBar, type Channel } from "@/components/store/channel-bar";
import { whatsappUrl } from "@/lib/store-contact";
import { matches } from "@/lib/search";
import { ArrowRight, Loader2 } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");
const grid = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3";
const KITS = "kits";
/** Tarjetas que se agregan por tanda al acercarse al final de la lista. */
const PAGE = 20;

type Section = { id: string; label: string; kits: StoreKit[]; products: StoreProduct[] };

/** initialCat: categoría que llega en ?cat= (compartir o volver a una categoría, ej. desde la ficha de un kit) */
export function Catalog({ products, kits, initialCat }: { products: StoreProduct[]; kits: StoreKit[]; initialCat?: string }) {
    const [query, setQuery] = useState("");
    const q = useDeferredValue(query).trim();
    const [selected, setSelected] = useState<string | null>(initialCat ?? null);
    const [visible, setVisible] = useState(PAGE);
    const sentinel = useRef<HTMLDivElement>(null);

    const sections: Section[] = useMemo(() => {
        const categories = [...new Set(products.map((p) => p.category))].sort();
        return [
            ...(kits.length > 0 ? [{ id: KITS, label: "Kits", kits, products: [] }] : []),
            ...categories.map((c) => ({ id: c, label: c, kits: [], products: products.filter((p) => p.category === c) })),
        ];
    }, [products, kits]);

    const channels: Channel[] = sections.map((s) => ({ id: s.id, label: s.label, count: s.kits.length + s.products.length }));

    const top = () => {
        const el = document.getElementById("catalogo");
        if (el && el.getBoundingClientRect().top < 0) {
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        }
    };

    const onSelect = (id: string | null) => {
        setSelected(id);
        setVisible(PAGE);
        const url = new URL(window.location.href);
        if (id) url.searchParams.set("cat", id);
        else url.searchParams.delete("cat");
        history.replaceState(null, "", url);
        top();
    };

    const onQuery = (v: string) => {
        if (!query.trim() && v.trim()) top();
        setQuery(v);
        setVisible(PAGE);
    };

    // Lo que se muestra: resultados de búsqueda, una sola categoría, o todas
    const shown: Section[] = useMemo(() => {
        if (q) {
            return [{
                id: "results",
                label: `Resultados: “${q}”`,
                kits: kits.filter((k) => matches(q, k.name, k.sku, "kit")),
                products: products.filter((p) => matches(q, p.name, p.sku, p.category)),
            }];
        }
        // Una categoría que ya no existe (link viejo) muestra todo
        const one = sections.filter((s) => s.id === selected);
        return one.length ? one : sections;
    }, [q, selected, sections, kits, products]);

    const total = shown.reduce((a, s) => a + s.kits.length + s.products.length, 0);
    const hasMore = visible < total;

    // Carga perezosa: cuando el sensor del final entra en pantalla (con margen), se suma otra tanda
    useEffect(() => {
        const el = sentinel.current;
        if (!el || !hasMore) return;
        const io = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting) setVisible((v) => v + PAGE); },
            { rootMargin: "800px 0px" },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [hasMore, visible]);

    // Reparte el cupo de tarjetas visibles entre las secciones, en orden
    let budget = visible;
    const rendered = shown.map((s) => {
        const kitsShown = s.kits.slice(0, budget);
        budget -= kitsShown.length;
        const productsShown = s.products.slice(0, budget);
        budget -= productsShown.length;
        return { ...s, kitsShown, productsShown };
    }).filter((s) => s.kitsShown.length + s.productsShown.length > 0 || s.id === "results");

    if (products.length === 0 && kits.length === 0) {
        return (
            <div className="border border-hud-line flex flex-col items-center justify-center py-24 text-center gap-2">
                <p className="osd text-osd-dim text-sm">Sin señal</p>
                <p>No hay productos disponibles por el momento.</p>
            </div>
        );
    }

    return (
        <>
            <ChannelBar
                channels={channels}
                selected={selected}
                onSelect={onSelect}
                query={query}
                onQuery={onQuery}
                resultCount={q ? total : null}
            />

            <div aria-live={q ? "polite" : undefined} className="space-y-10 sm:space-y-14 min-h-[50vh]">
                {rendered.map((s) => (
                    <section key={s.id} className="space-y-5">
                        <SectionHead
                            index={q ? undefined : sections.findIndex((x) => x.id === s.id) + 1}
                            label={s.label}
                            count={s.kits.length + s.products.length}
                        />
                        {s.id === "results" && total === 0 ? (
                            <NoResults q={q} />
                        ) : (
                            <div className={grid}>
                                {s.kitsShown.map((kit) => <KitCard key={kit.id} kit={kit} />)}
                                {s.productsShown.map((product) => <ProductCard key={product.id} product={product} />)}
                            </div>
                        )}
                    </section>
                ))}

                {hasMore && (
                    <div ref={sentinel} className="osd flex items-center justify-center gap-2 py-8 text-xs text-osd-dim" role="status">
                        <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                        Cargando más · {pad(Math.min(visible, total))}/{pad(total)}
                    </div>
                )}
            </div>
        </>
    );
}

function NoResults({ q }: { q: string }) {
    return (
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
    );
}

function SectionHead({ index, label, count }: { index?: number; label: string; count: number }) {
    return (
        <div className="flex items-baseline justify-between gap-4 border-b border-hud-line pb-3">
            <h2 className="osd text-2xl sm:text-3xl min-w-0 wrap-break-word">
                {index !== undefined && <span className="text-osd-dim mr-3 text-base sm:text-lg align-middle">CH{pad(index)}</span>}
                {label}
            </h2>
            <span className="osd text-xs text-osd-dim tabular-nums shrink-0">{pad(count)} items</span>
        </div>
    );
}
