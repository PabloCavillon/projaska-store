'use client';

import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface Channel {
    id: string;
    label: string;
}

/** Selector de canales: cada categoría es un canal; el contador sigue el scroll como un contador de cinta. */
interface ChannelBarProps {
    channels: Channel[];
    query: string;
    onQuery: (q: string) => void;
    /** null = sin búsqueda activa */
    resultCount: number | null;
}

export function ChannelBar({ channels, query, onQuery, resultCount }: ChannelBarProps) {
    const [active, setActive] = useState(0);
    const [more, setMore] = useState(false);
    const listRef = useRef<HTMLUListElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const searching = resultCount !== null; // las secciones se desmontan mientras se busca

    // "/" enfoca la búsqueda desde cualquier parte de la página (como en la mayoría de los catálogos)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement;
            if (e.key !== "/" || e.metaKey || e.ctrlKey || t.closest("input, textarea, select, [contenteditable=true]")) return;
            e.preventDefault();
            inputRef.current?.focus();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        const sections = channels
            .map((c) => document.getElementById(c.id))
            .filter((el): el is HTMLElement => el !== null);
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const idx = channels.findIndex((c) => c.id === entry.target.id);
                        if (idx >= 0) setActive(idx);
                    }
                }
            },
            { rootMargin: "-30% 0px -60% 0px" },
        );
        sections.forEach((s) => observer.observe(s));
        return () => observer.disconnect();
    }, [channels, searching]);

    // Fundido a la derecha solo mientras quedan canales fuera de vista
    useEffect(() => {
        const ul = listRef.current;
        if (!ul) return;
        const update = () => setMore(ul.scrollLeft + ul.clientWidth < ul.scrollWidth - 1);
        update();
        ul.addEventListener("scroll", update, { passive: true });
        const ro = new ResizeObserver(update);
        ro.observe(ul);
        return () => {
            ul.removeEventListener("scroll", update);
            ro.disconnect();
        };
    }, []);

    // Mantener el canal activo a la vista sin mover la página
    useEffect(() => {
        const ul = listRef.current;
        const li = ul?.children[active] as HTMLElement | undefined;
        if (!ul || !li) return;
        if (li.offsetLeft < ul.scrollLeft || li.offsetLeft + li.offsetWidth > ul.scrollLeft + ul.clientWidth) {
            ul.scrollTo({ left: li.offsetLeft - 16 });
        }
    }, [active]);

    // Desplazamiento suave a la sección (respeta scroll-mt y "reducir movimiento"); el #hash queda en la URL
    const goTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        history.replaceState(null, "", `#${id}`);
    };

    const pad = (n: number) => String(n).padStart(2, "0");

    return (
        <nav
            aria-label="Categorías"
            className="sticky top-16 z-40 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 bg-lb border-y border-hud-line"
        >
            <div className="flex items-center gap-4 h-12">
                <span className="osd text-sm text-osd shrink-0 tabular-nums hidden sm:inline" aria-hidden="true">
                    {resultCount === null ? `CH ${pad(active + 1)}/${pad(channels.length)}` : `${pad(resultCount)} res.`}
                </span>
                <ul
                    ref={listRef}
                    className={cn(
                        "flex-1 flex items-center gap-1 overflow-x-auto scrollbar-none min-w-0",
                        resultCount !== null && "invisible",
                        more && "[mask-image:linear-gradient(to_right,#000_calc(100%-3rem),transparent)]",
                    )}
                >
                    {channels.map((c, i) => (
                        <li key={c.id} className="shrink-0">
                            <a
                                href={`#${c.id}`}
                                onClick={(e) => goTo(e, c.id)}
                                aria-current={i === active ? "true" : undefined}
                                className={cn(
                                    "vf-frame vf-focus osd text-xs px-2.5 min-h-11 md:min-h-8 flex items-center",
                                    i === active ? "is-locked text-osd" : "text-osd-dim hover:text-osd",
                                )}
                            >
                                {c.label}
                            </a>
                        </li>
                    ))}
                </ul>
                <div role="search" className="relative shrink-0 flex items-center">
                    <Search size={14} className="absolute left-2.5 text-osd-dim pointer-events-none" aria-hidden="true" />
                    <input
                        ref={inputRef}
                        type="search"
                        value={query}
                        onChange={(e) => onQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Escape") onQuery(""); }}
                        placeholder="Buscar o SKU"
                        aria-label="Buscar en el catálogo por nombre, SKU o categoría"
                        className="vf-input !py-0 h-9 w-32 sm:w-56 pl-8 pr-8 text-sm [&::-webkit-search-cancel-button]:hidden"
                    />
                    {query ? (
                        <button
                            onClick={() => { onQuery(""); inputRef.current?.focus(); }}
                            className="absolute right-0 w-9 h-9 flex items-center justify-center text-osd-dim hover:text-osd cursor-pointer"
                            aria-label="Borrar búsqueda"
                        >
                            <X size={14} />
                        </button>
                    ) : (
                        <kbd className="osd absolute right-2.5 text-[11px] text-osd-dim pointer-events-none hidden md:inline" aria-hidden="true">/</kbd>
                    )}
                </div>
            </div>
        </nav>
    );
}
