'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/actions/products";
import { cn } from "@/lib/utils";
import { SerializedProduct } from "@/types/product";
import { Search, Edit2, Trash2, Loader2 } from "lucide-react";
import { SearchInput } from "../ui/search-input";

interface Props {
    products: SerializedProduct[];
}

export default function ProductsTable({ products: initialProducts }: Props) {
    const router = useRouter();
    const [products, setProducts] = useState<SerializedProduct[]>(initialProducts);
    const [search, setSearch] = useState("");
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

    const filtered = products.filter(p => {
        const searchTerm = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        return [p.name, p.sku, p.model ?? "", p.category].some(field => {
            if (!field) return false;
            const normalizedField = field.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return normalizedField.includes(searchTerm);
        });
    });

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.")) return;

        setIsDeletingId(id);
        try {
            await deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
            router.refresh();
        } catch (error) {
            console.error("Error deleting product", error);
        } finally {
            setIsDeletingId(null);
        }
    };

    const thClasses = "px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] text-left";

    return (
        <div className="flex flex-col">
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar productos..." />

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
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {filtered.map((product) => (
                                    <tr key={product.id} className="group hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-md text-zinc-400 uppercase tracking-tighter bg-zinc-100/50 px-2 py-1 rounded">
                                                #{product.sku}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-base text-zinc-900">
                                            {product.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-500">
                                            {product.category}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-base text-zinc-900">
                                            ${Number(product.price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border",
                                                product.stock >= 5 ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                    product.stock > 0 ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                        "bg-red-50 text-red-700 border-red-100"
                                            )}>
                                                {product.stock} {product.stock > 1 ? 'disponibles' : 'disponible'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest border",
                                                product.showInStore
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    : "bg-zinc-100 text-zinc-400 border-zinc-200"
                                            )}>
                                                {product.showInStore ? "Visible" : "Oculto"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <Link
                                                    href={`/admin/products/${product.id}/edit`}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-white border border-transparent hover:border-zinc-200 transition-all shadow-none hover:shadow-sm"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    disabled={isDeletingId === product.id}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer"
                                                >
                                                    {isDeletingId === product.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── MOBILE: cards ── */}
                    <div className="flex flex-col divide-y divide-zinc-100 md:hidden">
                        {filtered.map((product) => (
                            <div key={product.id} className="flex items-start justify-between px-4 py-4 hover:bg-zinc-50/50 transition-colors">
                                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                    <span className="font-mono text-xs text-zinc-400 uppercase tracking-tighter bg-zinc-100/50 px-2 py-0.5 rounded w-fit">
                                        #{product.sku}
                                    </span>
                                    <p className="font-bold text-base text-zinc-900 leading-snug">
                                        {product.name}
                                    </p>
                                    <p className="text-sm text-zinc-400">{product.category}</p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className="font-bold text-base text-zinc-900">
                                            ${Number(product.price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className={cn(
                                            "inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest border",
                                            product.stock >= 5 ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                product.stock > 0 ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                    "bg-red-50 text-red-700 border-red-100"
                                        )}>
                                            {product.stock} {product.stock > 1 ? 'disponibles' : 'disponible'}
                                        </span>
                                        <span className={cn(
                                            "inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest border",
                                            product.showInStore
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                : "bg-zinc-100 text-zinc-400 border-zinc-200"
                                        )}>
                                            {product.showInStore ? "Visible" : "Oculto"}
                                        </span>
                                    </div>
                                </div>

                                {/* Acciones mobile — siempre visibles */}
                                <div className="flex items-center gap-1 ml-3 shrink-0">
                                    <Link
                                        href={`/admin/products/${product.id}/edit`}
                                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-white border border-transparent hover:border-zinc-200 transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        disabled={isDeletingId === product.id}
                                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                                    >
                                        {isDeletingId === product.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}