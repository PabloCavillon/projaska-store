'use client';

import { cn } from "@/lib/utils";
import { useState } from "react";

/** Cantidad tipeable: el instalador escribe "24" en vez de tocar + veinte veces. Se aplica al salir o con Enter. */
export function QtyInput({ quantity, onChange, max, label, className }: { quantity: number; onChange: (q: number) => void; max?: number; label: string; className: string }) {
    const [draft, setDraft] = useState<string | null>(null);
    const commit = () => {
        if (draft === null) return;
        const n = parseInt(draft, 10);
        setDraft(null);
        if (!Number.isFinite(n) || n < 1) return; // vacío o 0: se mantiene; para quitar está la papelera
        const next = max !== undefined ? Math.min(n, max) : n;
        if (next !== quantity) onChange(next);
    };
    return (
        <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label={`Cantidad de ${label}`}
            value={draft ?? String(quantity)}
            onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 4))}
            onFocus={(e) => e.target.select()}
            onBlur={commit}
            onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") { setDraft(null); e.currentTarget.blur(); }
            }}
            className={cn("osd self-stretch bg-transparent text-center tabular-nums outline-none focus:bg-hud", className)}
        />
    );
}
