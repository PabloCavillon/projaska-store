'use client';

import { useCart } from "@/contexts/cart-context";
import { createStoreOrder } from "@/actions/store/store-orders.actions";
import { calcDiscount, calcPriceArs, type DiscountConfig, type PriceInfo } from "@/lib/price-utils";
import { whatsappUrl } from "@/lib/store-contact";
import { fmtArs } from "@/lib/utils";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CheckoutClientProps {
    config: PriceInfo & DiscountConfig;
    isGuild: boolean;
    customerName: string;
}

export function CheckoutClient({ config, isGuild, customerName }: CheckoutClientProps) {
    const { items, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (items.length === 0) {
        return (
            <div className="border border-hud-line flex flex-col items-center justify-center py-28 px-6 text-center gap-4">
                <p className="osd text-sm text-osd-dim">Carrito 00</p>
                <p className="text-xl">Tu carrito está vacío.</p>
                <Link href="/catalog" className="vf-btn vf-btn-primary">Ir al catálogo</Link>
            </div>
        );
    }

    const subtotalArs = items.reduce(
        (acc, i) => acc + calcPriceArs(i.priceUsd, config) * i.quantity,
        0,
    );

    const { pct: discountPct, type: discountType, amountArs: discountArs, totalArs } = calcDiscount(subtotalArs, config, isGuild);

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);
        let result: Awaited<ReturnType<typeof createStoreOrder>>;
        try {
            result = await createStoreOrder(
                items.map((i) => ({
                    productId: i.type === "product" ? i.id : undefined,
                    kitId: i.type === "kit" ? i.id : undefined,
                    quantity: i.quantity,
                    unit: i.unit,
                    unitsPerBox: i.unitsPerBox,
                })),
            );
        } catch {
            result = { error: "No pudimos enviar el pedido. Tu carrito sigue guardado: probá de nuevo en unos minutos." };
        }
        setLoading(false);

        if ("error" in result) {
            setError(result.error);
            return;
        }

        clearCart();
        router.push(`/orders/${result.code}`);
    };

    return (
        <div className="space-y-8">
            <div className="border-b border-hud-line pb-4">
                <h1 className="osd text-4xl">Confirmá tu pedido</h1>
                <p className="text-sm text-osd-dim mt-2">Hola, <span className="text-osd">{customerName}</span></p>
            </div>

            <ul className="divide-y divide-hud-line">
                {items.map((item) => {
                    const unitArs = calcPriceArs(item.priceUsd, config);
                    return (
                        <li key={item.cartKey} className="flex items-start justify-between py-4 gap-4">
                            <div className="min-w-0">
                                <p className="leading-snug">{item.name}</p>
                                <p className="osd text-xs text-osd-dim mt-1 flex gap-3 flex-wrap">
                                    <span>{item.quantity} × {fmtArs(unitArs)}</span>
                                    {item.type === "kit" && <span className="text-osd">Kit</span>}
                                    {item.unit === "box" && <span>Caja ×{item.unitsPerBox}</span>}
                                    {item.isOffer && <span className="text-osd">Oferta</span>}
                                </p>
                            </div>
                            <p className="osd shrink-0">{fmtArs(unitArs * item.quantity)}</p>
                        </li>
                    );
                })}
            </ul>

            <dl className="osd space-y-3 border-t border-hud-line pt-5 text-sm">
                <div className="flex justify-between">
                    <dt className="text-osd-dim">Subtotal</dt>
                    <dd>{fmtArs(subtotalArs)}</dd>
                </div>
                {discountPct > 0 && (
                    <div className="flex justify-between">
                        <dt>Descuento {discountType === "GUILD" ? "gremio" : "por volumen"} ({discountPct}%)</dt>
                        <dd>−{fmtArs(discountArs)}</dd>
                    </div>
                )}
                {discountPct === 0 && subtotalArs > 0 && (
                    <p className="font-sans normal-case tracking-normal text-xs text-osd-dim">
                        {isGuild
                            ? `Tenés descuento de gremio del ${config.guildDiscountPct}%.`
                            : `Compras mayores a ${fmtArs(config.volumeThresholdArs)} obtienen ${config.volumeDiscountPct}% de descuento.`}
                    </p>
                )}
                <div className="flex justify-between items-baseline pt-4 border-t border-hud-line">
                    <dt>Total estimado</dt>
                    <dd className="text-3xl sm:text-4xl">{fmtArs(totalArs)}</dd>
                </div>
            </dl>

            <section aria-labelledby="como-sigue" className="border-t border-hud-line pt-6 space-y-4">
                <h2 id="como-sigue" className="osd text-lg">Cómo sigue</h2>
                <ol className="space-y-3 text-sm leading-relaxed">
                    {[
                        "Confirmás el pedido. No se cobra nada en este paso.",
                        "Nos escribís por WhatsApp desde la página del pedido para coordinar el pago y el envío o retiro.",
                        `El total en pesos se cierra con la cotización del día del pago (hoy, 1 USD = ${fmtArs(config.dollarRate)}).`,
                    ].map((step, i) => (
                        <li key={i} className="flex gap-4">
                            <span className="osd text-osd-dim tabular-nums shrink-0">{i + 1}</span>
                            <span>{step}</span>
                        </li>
                    ))}
                </ol>
            </section>

            {error && (
                <div role="alert" className="border border-caution text-sm px-4 py-3 space-y-2">
                    <p className="text-caution">{error}</p>
                    <a
                        href={whatsappUrl("Hola! Tuve un problema al enviar un pedido desde la tienda.")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pj-ink hover:underline underline-offset-4 inline-flex items-center gap-2"
                    >
                        O escribinos por WhatsApp <ArrowRight size={14} aria-hidden="true" />
                    </a>
                </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between">
                <Link href="/cart" className="osd text-xs text-osd-dim hover:text-osd inline-flex items-center gap-2"><ArrowLeft size={14} aria-hidden="true" /> Volver al carrito</Link>
                <button onClick={handleConfirm} disabled={loading} className="vf-btn vf-btn-primary sm:px-10">
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? "Enviando pedido…" : <>Confirmar pedido <ArrowRight size={16} aria-hidden="true" /></>}
                </button>
            </div>
        </div>
    );
}
