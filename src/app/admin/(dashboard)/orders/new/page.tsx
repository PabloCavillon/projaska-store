import { getCustomers } from "@/actions/customers";
import { getProducts } from "@/actions/products";
import { OrderForm } from "@/components/orders/orders-from";
import { ChevronLeft, FilePlus2 } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: 'Nueva orden',
};

export default async function NewOrderPage() {
    const [customers, products] = await Promise.all([
        getCustomers(),
        getProducts()
    ]);

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Navegación Técnica Coherente */}
            <header className="space-y-6">
                <Link
                    href="/admin/orders"
                    className="inline-flex items-center text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 transition-colors gap-2 group"
                >
                    <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    Volver a Órdenes
                </Link>

                <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-100 rounded-[1.2rem]">
                        <FilePlus2 className="w-6 h-6 text-zinc-900" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tighter text-zinc-900">
                            Nueva Orden
                        </h1>
                        <p className="text-sm text-zinc-400 mt-1 font-light italic text-balance">
                            Genera un nuevo pedido vinculando cliente y productos.
                        </p>
                    </div>
                </div>
            </header>

            {/* Contenedor ADN Cuarzo Studio */}
            <section className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-zinc-100 shadow-[0_8px_30_rgb(0,0,0,0.02)]">
                <OrderForm customers={customers} products={products} />
            </section>

            <footer className="text-center pt-4">
                <p className="text-xs text-zinc-300 uppercase tracking-[0.3em] font-medium">
                    Sistema de Ventas • Cuarzo Studio
                </p>
            </footer>
        </div>
    );
}