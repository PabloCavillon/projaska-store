'use client';

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setProductShowInStore } from "@/actions/products";
import { cn } from "@/lib/utils";
import { SerializedProduct } from "@/types/product";
import { SearchInput } from "../ui/search-input";

interface Props {
    products: SerializedProduct[];
}

const fmtPrice = (n: number) => `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

function StockBadge({ stock, className }: { stock: number; className?: string }) {
    return (
        <span className={cn(
            "inline-flex rounded-full text-xs font-bold uppercase tracking-widest border",
            stock >= 5 ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                stock > 0 ? "bg-amber-50 text-amber-700 border-amber-100" :
                    "bg-red-50 text-red-700 border-red-100",
            className,
        )}>
            {stock} {stock > 1 ? 'disponibles' : 'disponible'}
        </span>
    );
}

/** Switch "Visible en tienda". Frena el click para que no abra la fila. */
function StoreSwitch({ product, onToggle, pending }: { product: SerializedProduct; onToggle: () => void; pending: boolean }) {
    const on = product.showInStore;
    return (
        <span className="inline-flex items-center gap-2">
            <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`Visible en tienda: ${product.name}`}
                disabled={pending}
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900",
                    on ? "bg-zinc-900" : "bg-zinc-200",
                )}
            >
                <span className={cn("inline-block h-4 w-4 rounded-full bg-white shadow transition-transform", on ? "translate-x-6" : "translate-x-1")} />
            </button>
            <span className={cn("text-xs font-bold uppercase tracking-widest", on ? "text-zinc-700" : "text-zinc-400")}>
                {on ? "Visible" : "Oculto"}
            </span>
        </span>
    );
}

/** Modelo clickeable: lo copia al portapapeles sin abrir la fila. */
function CopyModel({ model }: { model: string }) {
    const [copied, setCopied] = useState(false);
    const copy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(model);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Sin permiso de portapapeles (http o navegador viejo): no hay nada útil que mostrar.
        }
    };
    return (
        <button
            type="button"
            onClick={copy}
            title="Copiar modelo"
            aria-label={`Copiar modelo ${model}`}
            className="group/copy inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 hover:text-zinc-900 cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        >
            Modelo: {model}
            {copied
                ? <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                : <Copy className="w-3.5 h-3.5 opacity-0 group-hover/copy:opacity-100 transition-opacity" aria-hidden="true" />}
            <span aria-live="polite" className={copied ? "text-emerald-600" : "sr-only"}>{copied ? "Copiado" : ""}</span>
        </button>
    );
}

export default function ProductsTable({ products: initialProducts }: Props) {
    const router = useRouter();
    const [products, setProducts] = useState<SerializedProduct[]>(initialProducts);
    const [search, setSearch] = useState("");
    const [pendingId, setPendingId] = useState<string | null>(null);
    const [toggleError, setToggleError] = useState<string | null>(null);

    const filtered = products.filter(p => {
        const searchTerm = search.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

        return [p.name, p.sku, p.model ?? "", p.category].some(field => {
            if (!field) return false;
            const normalizedField = field.toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
            return normalizedField.includes(searchTerm);
        });
    });

    const editHref = (id: string) => `/admin/products/${id}/edit`;

    const handleToggle = async (product: SerializedProduct) => {
        const next = !product.showInStore;
        setToggleError(null);
        setPendingId(product.id);
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, showInStore: next } : p));
        try {
            await setProductShowInStore(product.id, next);
        } catch {
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, showInStore: !next } : p));
            setToggleError(`No se pudo cambiar la visibilidad de "${product.name}". Intentá de nuevo.`);
        } finally {
            setPendingId(null);
        }
    };

    const thClasses = "px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] text-left";

    return (
        <div className="flex flex-col">
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar productos..." />

            {toggleError && (
                <div role="alert" className="mx-4 md:mx-6 mb-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {toggleError}
                </div>
            )}

            {filtered.length === 0 ? (
                <div className="py-20 text-center text-zinc-400 italic font-light">
                    No se encontraron productos en tu inventario.
                </div>
            ) : (
                <>
                    {/* ── DESKTOP: tabla ── */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-50">
                                    <th className={thClasses}>SKU</th>
                                    <th className={thClasses}>Producto</th>
                                    <th className={thClasses}>Categoría</th>
                                    <th className={thClasses}>Precio</th>
                                    <th className={thClasses}>Stock</th>
                                    <th className={thClasses}>Tienda</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {filtered.map((product) => (
                                    <tr
                                        key={product.id}
                                        onClick={() => router.push(editHref(product.id))}
                                        className="hover:bg-zinc-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-md text-zinc-400 uppercase tracking-tighter bg-zinc-100/50 px-2 py-1 rounded">
                                                #{product.sku}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* Link real: teclado, lectores de pantalla y "abrir en pestaña nueva" */}
                                            <Link
                                                href={editHref(product.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="font-bold text-base text-zinc-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 rounded"
                                            >
                                                {product.name}
                                            </Link>
                                            {product.model && <div className="mt-1"><CopyModel model={product.model} /></div>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-500">
                                            {product.category}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-base text-zinc-900">
                                            {fmtPrice(product.price)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StockBadge stock={product.stock} className="px-3 py-1" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <StoreSwitch product={product} pending={pendingId === product.id} onToggle={() => handleToggle(product)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── MOBILE: cards ── */}
                    <div className="flex flex-col divide-y divide-zinc-100 md:hidden">
                        {filtered.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => router.push(editHref(product.id))}
                                className="flex flex-col gap-1.5 px-4 py-4 hover:bg-zinc-50 transition-colors cursor-pointer"
                            >
                                <span className="font-mono text-xs text-zinc-400 uppercase tracking-tighter bg-zinc-100/50 px-2 py-0.5 rounded w-fit">
                                    #{product.sku}
                                </span>
                                <Link
                                    href={editHref(product.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="font-bold text-base text-zinc-900 leading-snug focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 rounded"
                                >
                                    {product.name}
                                </Link>
                                {product.model && <div><CopyModel model={product.model} /></div>}
                                <p className="text-sm text-zinc-400">{product.category}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="font-bold text-base text-zinc-900">{fmtPrice(product.price)}</span>
                                    <StockBadge stock={product.stock} className="px-2.5 py-0.5" />
                                </div>
                                <div className="mt-2">
                                    <StoreSwitch product={product} pending={pendingId === product.id} onToggle={() => handleToggle(product)} />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
