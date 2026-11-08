"use client";

import { useEffect } from "react";

export default function GlobalError({
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
        <html lang="es">
            <body className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-4 text-center font-sans">
                <p className="text-8xl font-black text-zinc-100 leading-none select-none">500</p>
                <div className="-mt-6 space-y-2">
                    <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">
                        Algo salió mal
                    </h1>
                    <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                        Ocurrió un error inesperado. Podés intentar de nuevo o volver al inicio.
                    </p>
                    {error.digest && (
                        <p className="text-xs font-mono text-zinc-300">ref: {error.digest}</p>
                    )}
                </div>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={reset}
                        className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 transition-colors"
                    >
                        Intentar de nuevo
                    </button>
                    <a
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-bold hover:bg-zinc-100 transition-colors"
                    >
                        Volver al inicio
                    </a>
                </div>
            </body>
        </html>
    );
}
