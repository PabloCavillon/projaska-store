import { redirect } from "next/navigation";
import { getStoreSession } from "@/lib/store-auth";
import { getMyStoreOrders } from "@/actions/store/store-orders.actions";
import { whatsappUrl } from "@/lib/store-contact";
import { cn, fmtArs } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = { title: "Mis pedidos", robots: { index: false } };

import { STATUS_LABEL, STATUS_TONE } from "@/lib/store-order-status";

export default async function MyOrdersPage() {
    const session = await getStoreSession();
    if (!session) redirect("/login?redirect=/orders");

    const orders = await getMyStoreOrders();

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-baseline justify-between border-b border-hud-line pb-4">
                <h1 className="osd text-4xl">Mis pedidos</h1>
                <span className="osd text-sm text-osd-dim tabular-nums">{String(orders.length).padStart(2, "0")} pedidos</span>
            </div>

            {orders.length === 0 ? (
                <div className="border border-hud-line flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
                    <p className="text-lg">Todavía no hiciste ningún pedido.</p>
                    <Link href="/" className="vf-btn vf-btn-primary">Ir al catálogo</Link>
                </div>
            ) : (
                <ul className="divide-y divide-hud-line">
                    {orders.map((order) => (
                        <li key={order.id} className="py-1">
                            <Link
                                href={`/orders/${order.code}`}
                                className="vf-frame vf-focus flex items-center justify-between gap-4 px-3 py-4"
                            >
                                <div className="flex flex-col gap-1.5 min-w-0">
                                    <div className="osd flex items-center gap-4 flex-wrap">
                                        <span className="text-lg">{order.code}</span>
                                        <span className={cn("text-xs", STATUS_TONE[order.status] ?? "text-osd")}>
                                            <span className="inline-block w-2 h-2 rounded-full bg-current mr-2 align-middle" aria-hidden="true" />{STATUS_LABEL[order.status] ?? order.status}
                                        </span>
                                        {order.discountApplied > 0 && <span className="text-xs text-osd-dim">Descuento {order.discountApplied}%</span>}
                                    </div>
                                    <p className="osd text-xs text-osd-dim">
                                        {order.items.length} artículo{order.items.length !== 1 ? "s" : ""} · {new Date(order.createdAt).toLocaleDateString("es-AR")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    {order.totalArs !== null && <span className="osd">{fmtArs(order.totalArs)}</span>}
                                    <ArrowRight size={16} className="text-osd-dim" aria-hidden="true" />
                                </div>
                            </Link>
                            {order.status === "PENDING" && (
                                <a
                                    href={whatsappUrl(`Hola! Realicé la orden ${order.code}, quería coordinar el pago y el envío/retiro.`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="osd inline-flex items-center gap-2 text-xs text-caution hover:text-osd px-3 pb-3 min-h-11"
                                >
                                    Coordinar pago y envío por WhatsApp <ArrowRight size={16} aria-hidden="true" />
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
