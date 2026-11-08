"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function StoreError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="border border-hud-line max-w-2xl mx-auto relative flex flex-col items-center justify-center py-24 px-6 text-center gap-5 overflow-hidden">
            <span className="zebra absolute inset-x-0 top-0 h-3 opacity-60" aria-hidden="true" />
            <p className="osd text-sm text-caution">Sin señal</p>
            <h2 className="text-2xl">Algo salió mal</h2>
            <p className="text-sm text-osd-dim max-w-xs">Ocurrió un error inesperado. Podés intentar de nuevo.</p>
            {error.digest && <p className="osd text-xs text-osd-dim">ref {error.digest}</p>}
            <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={reset} className="vf-btn vf-btn-primary">Intentar de nuevo</button>
                <Link href="/catalog" className="vf-btn vf-btn-ghost">Volver al catálogo</Link>
            </div>
        </div>
    );
}
