import { getAdminStoreOrder } from "@/actions/store/store-orders.actions";
import { notFound } from "next/navigation";
import { ChevronLeft, Store } from "lucide-react";
import Link from "next/link";
import { STORE_STATUS_LABEL, STORE_STATUS_STYLE } from "@/types/order-status";
import { StoreOrderStatus } from "@/generated/prisma/enums";

export const metadata = {
    title: 'Pedido de Tienda',
}

export default async function StoreOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = await getAdminStoreOrder(id);
    if (!order) notFound();

    const status = order.status as StoreOrderStatus;
    const discountFactor = 1 - order.discountApplied / 100;
    const estimatedArs = order.totalArs ?? Math.round(order.subtotalUsd * discountFactor * order.dollarRateAtCreation);

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-10 animate-in fade-in duration-500">

            <header className="space-y-6">
                <Link
                    href="/admin/orders"
                    className="inline-flex items-center text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 transition-colors gap-2 group"
                >
                    <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    Volver al Listado
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-900 rounded-[1.2rem]">
                            <Store className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tighter text-zinc-900">
                                Pedido #{order.code.split('-')[1]}
                            </h1>
                            <p className="text-sm text-zinc-400 mt-1 font-light">
                                Cliente: <span className="text-zinc-900 font-medium">{order.customerName}</span>
                            </p>
                        </div>
                    </div>

                    <div className={`px-4 py-2 border rounded-full text-xs font-bold uppercase tracking-widest ${STORE_STATUS_STYLE[status]}`}>
                        {STORE_STATUS_LABEL[status]}
                    </div>
                </div>
            </header>

            <section className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">

                <div className="px-8 md:px-12 pt-10 pb-6">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-6">
                        Productos
                    </p>

                    <div className="space-y-3">
                        {order.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between py-4 border-b border-zinc-50 last:border-0"
                            >
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-semibold text-zinc-900">
                                        {item.productName ?? item.kitName ?? "Artículo"}
                                    </span>
                                    {(item.productSku ?? item.kitSku) && (
                                        <span className="text-xs font-mono text-zinc-400 uppercase">
                                            {item.productSku ?? item.kitSku}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-8 text-sm">
                                    <div className="text-center">
                                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-0.5">Cant.</p>
                                        <p className="font-semibold text-zinc-900">{item.quantity}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-0.5">Precio</p>
                                        <p className="font-semibold text-zinc-900">USD {item.unitPriceUsd.toFixed(2)}</p>
                                    </div>
                                    <div className="text-center min-w-20">
                                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-0.5">Subtotal</p>
                                        <p className="font-semibold text-zinc-900">USD {(item.unitPriceUsd * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-zinc-50 px-8 md:px-12 py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-1 text-sm text-zinc-400">
                        <p>
                            Creado el{" "}
                            {new Date(order.createdAt).toLocaleDateString("es-AR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                        <p>
                            Tipo de descuento:{" "}
                            <span className="text-zinc-700 font-medium">
                                {order.discountApplied > 0 ? `${order.discountApplied}% (${order.discountType ?? "-"})` : "Sin descuento"}
                            </span>
                        </p>
                        <p>
                            Dólar de referencia:{" "}
                            <span className="text-zinc-700 font-medium">${order.dollarRateAtCreation.toLocaleString("es-AR")}</span>
                        </p>
                        {order.notes && (
                            <p className="text-zinc-500 italic mt-1">"{order.notes}"</p>
                        )}
                    </div>

                    <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-1">
                            Total USD
                        </p>
                        <p className="text-2xl font-extrabold tracking-tighter text-zinc-900">
                            USD {(order.subtotalUsd * discountFactor).toFixed(2)}
                        </p>
                        <p className="text-sm text-zinc-400 mt-0.5">
                            ≈ ${estimatedArs.toLocaleString("es-AR")} ARS
                        </p>
                    </div>
                </div>

            </section>
        </div>
    );
}
