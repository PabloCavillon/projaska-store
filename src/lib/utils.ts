import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formatea un número como pesos argentinos con separador de miles por punto.
 * Usa regex en lugar de Intl/toLocaleString para garantizar output idéntico
 * entre Node.js (SSR) y el browser, evitando hydration mismatches.
 * Ej: 244243 → "$ 244.243"
 */
export function fmtArs(n: number): string {
    const abs = Math.round(Math.abs(n));
    const sign = n < 0 ? "-" : "";
    const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${sign}$ ${formatted}`;
}
/** Precio de venta en dólares (pesos ÷ cotización). Ej: 12.5 → "US$ 12,50"; 1234 → "US$ 1.234" */
export function fmtUsd(n: number): string {
    const [int, dec] = Math.abs(n).toFixed(n < 100 ? 2 : 0).split(".");
    return `US$ ${int.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${dec ? `,${dec}` : ""}`;
}
/** Solo rutas internas: evita redirigir a otro dominio con ?redirect=//evil.com o https://... */
export function safeRedirect(path: string | null | undefined, fallback = "/"): string {
    if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return fallback;
    return path;
}

/** JSON para <script type="application/ld+json">: escapa "<" para que un texto con "</script>" no cierre el bloque. */
export function jsonLdHtml(data: unknown): string {
    return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** onKeyDown de <form>: Enter en un input no envía el formulario (solo el botón Guardar). Textareas y botones no cambian. */
export function preventEnterSubmit(e: { key: string; target: EventTarget | null; preventDefault(): void }) {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) e.preventDefault();
}
