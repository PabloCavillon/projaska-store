import { getOrder } from "@/actions/orders";
import { notFound } from "next/navigation";
import { ChevronLeft, Receipt } from "lucide-react";
import Link from "next/link";
import { STATUS_LABEL, STATUS_STYLE } from "@/types/order-status";
import DownloadReceiptButton from "@/components/receipts/DownloadReceiptButton";

export const metadata = {
    title: 'Orden',
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const order = await getOrder(id)
    if (!order) notFound()

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
                            <Receipt className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tighter text-zinc-900">
                                Orden #{order.code.split('-')[1]}
                            </h1>
                            <p className="text-sm text-zinc-400 mt-1 font-light">
                                Cliente: <span className="text-zinc-900 font-medium">{order.customer.name}</span>
                            </p>
                        </div>
                    </div>

                    <div className={`px-4 py-2 border rounded-full text-xs font-bold uppercase tracking-widest ${STATUS_STYLE[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                    </div>
                </div>
            </header>

            <section className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">

                {/* Tabla de items */}
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
                                    <span className="text-sm font-semibold text-zinc-900">{item.product.name}</span>
                                    <span className="text-xs font-mono text-zinc-400 uppercase">{item.product.sku}</span>
                                </div>
                                <div className="flex items-center gap-8 text-sm">
                                    <div className="text-center">
                                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-0.5">Cant.</p>
                                        <p className="font-semibold text-zinc-900">{item.quantity}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-0.5">Precio</p>
                                        <p className="font-semibold text-zinc-900">${item.unitPrice.toFixed(2)}</p>
                                    </div>
                                    <div className="text-center min-w-20 ">
                                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-0.5">Subtotal</p>
                                        <p className="font-semibold text-zinc-900">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer con total y metadata */}
                <div className="bg-zinc-50 px-8 md:px-12 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1 text-sm text-zinc-400">
                        <p>
                            Gestionado por <span className="text-zinc-700 font-medium">{order.user.username}</span>
                        </p>
                        <p>
                            {new Date(order.createdAt).toLocaleDateString("es-AR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                        {order.notes && (
                            <p className="text-zinc-500 italic mt-1">"{order.notes}"</p>
                        )}
                    </div>

                    <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-1">Total</p>
                        <p className="text-3xl font-extrabold tracking-tighter text-zinc-900">
                            ${order.total.toFixed(2)}
                        </p>
                    </div>
                </div>

            </section>

            <div className="w-full flex justify-center items-center">
                <DownloadReceiptButton orderId={order.id} orderCode={order.code} />
            </div>
        </div>
    )
}