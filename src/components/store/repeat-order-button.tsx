'use client';

import { getReorderItems } from "@/actions/store/reorder.actions";
import { useCart } from "@/contexts/cart-context";
import { ArrowRight, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Carga las líneas de un pedido anterior al carrito (se suman a lo que ya haya). */
export function RepeatOrderButton({ code }: { code: string }) {
    const { items: cart, addItem, updateQuantity } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [notice, setNotice] = useState<{ error?: string; skipped?: string[] } | null>(null);

    const repeat = async () => {
        setLoading(true);
        setNotice(null);
        let result: Awaited<ReturnType<typeof getReorderItems>>;
        try {
            result = await getReorderItems(code);
        } catch {
            result = { error: "No pudimos cargar el pedido. Probá de nuevo en unos minutos." };
        }
        setLoading(false);
        if ("error" in result) return setNotice({ error: result.error });

        for (const { quantity, ...item } of result.items) {
            const existing = cart.find((c) => c.cartKey === item.cartKey)?.quantity ?? 0;
            addItem(item);
            updateQuantity(item.cartKey, existing + quantity);
        }
        if (result.skipped.length === 0) return router.push("/cart");
        setNotice(result.items.length ? { skipped: result.skipped } : { error: `Ninguno de esos artículos tiene stock ahora: ${result.skipped.join(", ")}.` });
    };

    return (
        <div className="space-y-3">
            <button onClick={repeat} disabled={loading} className="vf-btn vf-btn-ghost w-full sm:w-auto">
                {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <RotateCcw size={16} aria-hidden="true" />}
                {loading ? "Cargando…" : "Repetir pedido"}
            </button>
            {notice && (
                <div role="status" className="border border-hud-line bg-hud px-4 py-3 text-sm space-y-2">
                    {notice.error ? (
                        <p className="text-caution">{notice.error}</p>
                    ) : (
                        <>
                            <p>Cargamos el resto al carrito. Sin stock por ahora: {notice.skipped!.join(", ")}.</p>
                            <Link href="/cart" className="osd text-xs text-pj-ink hover:text-osd inline-flex items-center gap-2 min-h-11">
                                Ir al carrito <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                        </>
                    )}
                </div>
            )}
            <p className="text-xs text-osd-dim">Se carga con precios y stock de hoy. Lo que compraste por caja vuelve como unidades.</p>
        </div>
    );
}
