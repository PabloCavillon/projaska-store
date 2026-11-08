'use client';

import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface Channel {
    id: string;
    label: string;
    count: number;
}

interface ChannelBarProps {
    channels: Channel[];
    /** null = todos los canales */
    selected: string | null;
    onSelect: (id: string | null) => void;
    query: string;
    onQuery: (q: string) => void;
    /** null = sin búsqueda activa */
    resultCount: number | null;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Selector de canales: cada categoría es un canal y elegir uno filtra el catálogo. CH 00 = todos. */
export function ChannelBar({ channels, selected, onSelect, query, onQuery, resultCount }: ChannelBarProps) {
    const [more, setMore] = useState(false);
    const listRef = useRef<HTMLUListElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const activeIdx = selected === null ? 0 : channels.findIndex((c) => c.id === selected) + 1;

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

    // Mantener el canal elegido a la vista dentro de la tira
    useEffect(() => {
        const ul = listRef.current;
        const li = ul?.children[activeIdx] as HTMLElement | undefined;
        if (!ul || !li) return;
        if (li.offsetLeft < ul.scrollLeft || li.offsetLeft + li.offsetWidth > ul.scrollLeft + ul.clientWidth) {
            ul.scrollTo({ left: li.offsetLeft - 16 });
        }
    }, [activeIdx]);

    const all: Channel = { id: "", label: "Todos", count: channels.reduce((a, c) => a + c.count, 0) };

    return (
        <nav
            aria-label="Categorías"
            className="sticky top-16 z-40 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 bg-lb border-y border-hud-line"
        >
            <div className="flex items-center gap-4 h-12">
                <span className="osd text-sm text-osd shrink-0 tabular-nums hidden sm:inline" aria-hidden="true">
                    {resultCount === null ? `CH ${pad(activeIdx)}/${pad(channels.length)}` : `${pad(resultCount)} res.`}
                </span>
                <ul
                    ref={listRef}
                    className={cn(
                        "flex-1 flex items-center gap-1 overflow-x-auto scrollbar-none min-w-0",
                        more && "mask-[linear-gradient(to_right,#000_calc(100%-3rem),transparent)]",
                        resultCount !== null && "invisible",
                    )}
                >
                    {[all, ...channels].map((c, i) => {
                        const isActive = i === activeIdx;
                        return (
                            <li key={c.id || "all"} className="shrink-0">
                                <button
                                    type="button"
                                    onClick={() => onSelect(c.id || null)}
                                    aria-pressed={isActive}
                                    className={cn(
                                        "vf-frame vf-focus osd text-xs px-2.5 min-h-11 md:min-h-8 flex items-center gap-2 cursor-pointer",
                                        isActive ? "is-locked text-osd" : "text-osd-dim hover:text-osd",
                                    )}
                                >
                                    {c.label}
                                    <span className="text-osd-dim tabular-nums">{c.count}</span>
                                </button>
                            </li>
                        );
                    })}
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
                        className="vf-input py-0! h-9 w-32 sm:w-56 pl-8 pr-8 text-sm [&::-webkit-search-cancel-button]:hidden"
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
