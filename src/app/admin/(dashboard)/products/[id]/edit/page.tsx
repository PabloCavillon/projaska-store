import { getProduct } from "@/actions/products";
import { getPriceConfig } from "@/actions/config";
import { ProductForm } from "@/components/products/product-form";
import { DeleteProductButton } from "@/components/products/delete-product-button";
import { notFound } from "next/navigation";
import { ChevronLeft, Edit3 } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: 'Producto',
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [product, config] = await Promise.all([getProduct(id), getPriceConfig()]);

    if (!product) notFound();

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-12 space-y-8 animate-in fade-in duration-500">

            {/* Navegación y Header */}
            <header className="space-y-6">
                <Link
                    href="/admin/products"
                    className="inline-flex items-center text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 transition-colors gap-2 group"
                >
                    <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    Volver al Inventario
                </Link>

                <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-900 rounded-[1.2rem] shrink-0">
                        <Edit3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-zinc-900">
                            Editar Producto
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1 font-light italic">
                            Modificando: <span className="text-zinc-900 font-medium not-italic">{product.name}</span>
                        </p>
                    </div>
                </div>
            </header>

            {/* Contenedor form */}
            <section className="bg-white p-6 md:p-12 rounded-3xl border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <ProductForm product={product} config={config} />
            </section>

            <section aria-labelledby="zona-peligro" className="p-6 md:p-8 rounded-3xl border border-red-100 bg-red-50/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 id="zona-peligro" className="text-sm font-black text-red-700 uppercase tracking-widest">Eliminar producto</h2>
                    <p className="text-sm text-zinc-500 mt-1">Deja de aparecer en el inventario y en la tienda. Los pedidos anteriores se conservan.</p>
                </div>
                <DeleteProductButton id={product.id} name={product.name} />
            </section>
        </div>
    );
}