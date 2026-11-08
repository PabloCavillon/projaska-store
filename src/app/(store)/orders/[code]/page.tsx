import { redirect, notFound } from "next/navigation";
import { getStoreSession } from "@/lib/store-auth";
import { getMyStoreOrder } from "@/actions/store/store-orders.actions";
import { getPriceConfig } from "@/actions/config";
import { calcPriceArs } from "@/lib/price-utils";
import { whatsappUrl } from "@/lib/store-contact";
import { cn, fmtArs } from "@/lib/utils";
import Link from "next/link";
import { RepeatOrderButton } from "@/components/store/repeat-order-button";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { STATUS_LABEL, STATUS_TONE } from "@/lib/store-order-status";

export default async function OrderDetailPage({
    params,
}: {
    params: Promise<{ code: string }>;
}) {
    const { code } = await params;
    const session = await getStoreSession();
    if (!session) redirect(`/login?redirect=/orders/${code}`);

    const [order, config] = await Promise.all([getMyStoreOrder(code), getPriceConfig()]);
    if (!order) notFound();

    const priceConfig = config
        ? { dollarRate: config.dollarRate, shippingPct: config.shippingPct, profitPct: config.profitPct }
        : null;

    const estimatedArs = order.items.reduce((acc, i) => {
        if (!priceConfig) return acc;
        return acc + calcPriceArs(i.unitPriceUsd, {
            dollarRate: order.dollarRateAtCreation,
            shippingPct: priceConfig.shippingPct,
            profitPct: priceConfig.profitPct,
        }) * i.quantity;
    }, 0);

    const discountArs = estimatedArs * (order.discountApplied / 100);
    const totalEstimated = estimatedArs - discountArs;

    const waUrl = whatsappUrl(`Hola! Realicé la orden ${order.code}, quería coordinar el pago y el envío/retiro.`);

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <Link href="/orders" className="osd text-xs text-osd-dim hover:text-osd inline-flex items-center gap-2">
                <ArrowLeft size={14} aria-hidden="true" /> Mis pedidos
            </Link>

            <div className="border-b border-hud-line pb-5 space-y-2">
                <div className="osd flex items-baseline justify-between gap-4 flex-wrap">
                    <h1 className="text-4xl">{order.code}</h1>
                    <span className={cn("text-sm", STATUS_TONE[order.status] ?? "text-osd")}>
                        <span className="inline-block w-2 h-2 rounded-full bg-current mr-2 align-middle" aria-hidden="true" />{STATUS_LABEL[order.status] ?? order.status}
                    </span>
                </div>
                <p className="osd text-xs text-osd-dim">
                    {new Date(order.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
            </div>

            {order.status === "PENDING" && (
                <div className="border border-caution p-5 sm:p-6 space-y-4">
                    <p className="leading-relaxed">
                        Recibimos tu pedido. El próximo paso es escribirnos por WhatsApp para coordinar el pago y la entrega o retiro; ahí te confirmamos el total en pesos.
                    </p>
                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="vf-btn vf-btn-primary w-full sm:w-auto">
                        Coordinar por WhatsApp <ArrowRight size={16} aria-hidden="true" />
                    </a>
                </div>
            )}

            <div>
                <p className="vf-label">Artículos</p>
                <ul className="divide-y divide-hud-line border-y border-hud-line">
                    {order.items.map((item) => {
                        const lineArs = priceConfig
                            ? calcPriceArs(item.unitPriceUsd, {
                                dollarRate: order.dollarRateAtCreation,
                                shippingPct: priceConfig.shippingPct,
                                profitPct: priceConfig.profitPct,
                            }) * item.quantity
                            : null;

                        return (
                            <li key={item.id} className="flex items-baseline justify-between py-4 gap-4">
                                <div className="flex items-baseline gap-4 min-w-0">
                                    <span className="osd text-osd-dim tabular-nums w-10 shrink-0">{item.quantity}×</span>
                                    <span>{item.productName ?? item.kitName ?? "Artículo"}</span>
                                </div>
                                {lineArs !== null && <span className="osd shrink-0">{fmtArs(lineArs)}</span>}
                            </li>
                        );
                    })}
                </ul>
            </div>

            <dl className="osd space-y-3 text-sm">
                {order.discountApplied > 0 && (
                    <div className="flex justify-between">
                        <dt>Descuento {order.discountType === "GUILD" ? "gremio" : "por volumen"} ({order.discountApplied}%)</dt>
                        <dd>−{fmtArs(discountArs)}</dd>
                    </div>
                )}
                {order.totalArs !== null ? (
                    <div className="flex justify-between items-baseline">
                        <dt>Total confirmado</dt>
                        <dd className="text-3xl sm:text-4xl">{fmtArs(order.totalArs)}</dd>
                    </div>
                ) : (
                    <div className="flex justify-between items-baseline gap-4">
                        <dt>Total estimado</dt>
                        <dd className="text-right">
                            <span className="block text-3xl sm:text-4xl">{fmtArs(totalEstimated)}</span>
                            <span className="block font-sans normal-case tracking-normal text-xs text-osd-dim mt-1">Sujeto a cotización al momento del pago</span>
                        </dd>
                    </div>
                )}
            </dl>

            <div className="border-t border-hud-line pt-6">
                <RepeatOrderButton code={order.code} />
            </div>
        </div>
    );
}
