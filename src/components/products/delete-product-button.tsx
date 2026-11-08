'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteProduct } from "@/actions/products";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!confirm(`¿Eliminar "${name}"? Deja de aparecer en el inventario y en la tienda.`)) return;
        setDeleting(true);
        setError(null);
        try {
            await deleteProduct(id);
            router.push("/admin/products");
            router.refresh();
        } catch {
            setError("No se pudo eliminar el producto. Intentá de nuevo.");
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-60 transition-colors cursor-pointer"
            >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? "Eliminando..." : "Eliminar producto"}
            </button>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
