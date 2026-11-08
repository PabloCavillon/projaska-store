import { cn } from "@/lib/utils";
import { Minus, Plus, Trash2 } from "lucide-react";
import { QtyInput } from "./qty-input";

const LOW_STOCK = 3;

/** Stock como dato: blanco normal, ámbar bajo umbral o por encargo, zebra sin stock. */
export function StockReadout({ stock, isMadeToOrder, className }: { stock: number; isMadeToOrder: boolean; className?: string }) {
    if (stock === 0 && !isMadeToOrder) {
        return (
            <span className={cn("osd inline-flex items-center gap-2 text-osd-dim", className)}>
                <span className="zebra inline-block w-6 h-3" aria-hidden="true" />
                Sin stock
            </span>
        );
    }
    if (stock === 0) return <span className={cn("osd text-caution", className)}>Por encargo</span>;
    if (stock <= LOW_STOCK) return <span className={cn("osd text-caution", className)}>Últimas {stock}</span>;
    return <span className={cn("osd text-osd-dim", className)}>Stock {stock}</span>;
}

interface QtyStepperProps {
    quantity: number;
    onChange: (q: number) => void;
    max?: number;
    size?: "sm" | "lg";
    label: string;
    className?: string;
}

export function QtyStepper({ quantity, onChange, max, size = "sm", label, className }: QtyStepperProps) {
    const box = size === "lg" ? "w-12 h-12" : "w-11 h-11 md:w-9 md:h-9";
    const atMax = max !== undefined && quantity >= max;
    return (
        <div className={cn("flex items-center border border-hud-line", className)} role="group" aria-label={`Cantidad de ${label}`}>
            <button
                onClick={() => onChange(quantity - 1)}
                className={cn(
                    box,
                    "flex items-center justify-center hover:bg-hud cursor-pointer",
                    // En 1 el botón quita el artículo: tachito en rojo para que se lea como borrar
                    quantity === 1 ? "text-red-500 hover:text-red-400" : "text-osd-dim hover:text-osd",
                )}
                aria-label={quantity === 1 ? "Quitar del carrito" : "Restar uno"}
            >
                {quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
            </button>
            <QtyInput quantity={quantity} onChange={onChange} max={max} label={label} className={size === "lg" ? "text-xl w-14" : "text-base w-11 md:w-10"} />
            <button
                onClick={() => onChange(quantity + 1)}
                disabled={atMax}
                className={cn(box, "flex items-center justify-center bg-pj text-white hover:bg-pj-hi cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed")}
                aria-label="Sumar uno"
            >
                <Plus size={14} />
            </button>
        </div>
    );
}

/** Profundidad de la vista: W = catálogo (panorama), T = ficha de producto (detalle). */
export function zoomOf(pathname: string): number {
    if (pathname.startsWith("/products/") || pathname.startsWith("/kits/")) return 0.92;
    if (pathname === "/" || pathname.startsWith("/catalog")) return 0.08;
    return 0.5;
}

/** Barra de zoom W–T del visor. `level` 0 = W, 1 = T. Decorativa: la ruta ya comunica la vista. */
export function ZoomBar({ level, ticks = 28, className }: { level: number; ticks?: number; className?: string }) {
    const active = Math.round(level * (ticks - 1));
    return (
        <div className={cn("osd flex items-center gap-2 text-xs text-osd-dim", className)} aria-hidden="true">
            <span>W</span>
            <span className="flex items-center gap-[3px] h-3.5">
                {Array.from({ length: ticks }, (_, i) => (
                    <span
                        key={i}
                        className={cn("w-px", i === active ? "h-3.5 w-[3px] bg-caution" : i < active ? "h-2.5 bg-caution/60" : "h-2.5 bg-hud-line")}
                    />
                ))}
            </span>
            <span>T</span>
        </div>
    );
}
