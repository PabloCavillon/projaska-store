'use client'

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createProduct, updateProduct } from "@/actions/products";
import { ProductFormData, ProductFormInput, productSchema } from '@/lib/validations/product';
import { SerializedProduct } from "@/types/product";
import { SerializedPriceConfig } from "@/actions/config";
import { ImagePlus, Loader2, Save, X, TrendingDown, Info, ClipboardList, Store } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

function calcPriceArs(priceUsd: number, config: SerializedPriceConfig) {
    return priceUsd * config.dollarRate * (1 + config.shippingPct / 100) * (1 + config.profitPct / 100);
}

function fmtArs(n: number) {
    return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

interface Props {
    product?: SerializedProduct;
    config?: SerializedPriceConfig | null;
}

export function ProductForm({ product, config }: Props) {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string>(product?.imageUrl ?? "");
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<ProductFormInput, unknown, ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            sku: product?.sku ?? '',
            name: product?.name ?? '',
            description: product?.description ?? '',
            imageUrl: product?.imageUrl ?? '',
            price: product ? Number(product.price) : undefined,
            stock: product?.stock ?? 0,
            category: product?.category ?? '',
            unitsPerBox: product?.unitsPerBox ?? undefined,
            offerDiscountPct: product?.offerDiscountPct ?? undefined,
            offerUnit: (product?.offerUnit as "unit" | "box" | undefined) ?? undefined,
            isMadeToOrder: product?.isMadeToOrder ?? false,
            showInStore: product?.showInStore ?? true,
        }
    });

    const priceValue = watch("price");
    const discountPct = watch("offerDiscountPct");
    const offerUnit = watch("offerUnit");
    const unitsPerBoxValue = watch("unitsPerBox");
    const isMadeToOrderValue = watch("isMadeToOrder");
    const showInStoreValue = watch("showInStore");

    // Live offer preview
    const priceNum = Number(priceValue);
    const discountNum = Number(discountPct);
    const showPreview = config && priceNum > 0 && discountNum > 0 && discountNum < 100 && offerUnit;
    let offerPreview: { offerPriceArs: number; regularPriceArs: number; costArs: number; offerProfitArs: number; regularProfitArs: number } | null = null;
    if (showPreview) {
        const baseUsd = priceNum;
        const pct = discountNum;
        const isBox = offerUnit === "box";
        const units = isBox && unitsPerBoxValue ? Number(unitsPerBoxValue) : 1;

        const regularUsd = isBox ? baseUsd * units : baseUsd;
        const offerUsd = regularUsd * (1 - pct / 100);

        const regularPriceArs = Math.round(calcPriceArs(regularUsd, config));
        const offerPriceArs = Math.round(calcPriceArs(offerUsd, config));
        const costArs = Math.round(regularUsd * config.dollarRate * (1 + config.shippingPct / 100));
        const regularProfitArs = regularPriceArs - costArs;
        const offerProfitArs = offerPriceArs - costArs;

        offerPreview = { offerPriceArs, regularPriceArs, costArs, offerProfitArs, regularProfitArs };
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadError(null);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            if (!res.ok) throw new Error(await res.text());
            const blob = await res.json();
            setImageUrl(blob.url);
        } catch {
            setUploadError("Error al subir la imagen. Intentá de nuevo.");
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (data: ProductFormData) => {
        setServerError(null);
        try {
            const payload = {
                ...data,
                imageUrl: imageUrl || undefined,
                unitsPerBox: data.unitsPerBox ?? null,
                offerDiscountPct: data.offerDiscountPct ?? null,
                offerUnit: data.offerUnit ?? null,
                isMadeToOrder: data.isMadeToOrder ?? false,
                showInStore: data.showInStore ?? true,
            };
            if (product) await updateProduct(product.id, payload);
            else await createProduct(payload);
            router.push("/admin/products");
            router.refresh();
        } catch {
            setServerError("Error al guardar el producto.");
        }
    };

    const labelClasses = "text-xs font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2 ml-1 block";
    const inputClasses = "w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-base transition-all outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 disabled:bg-zinc-50 placeholder:text-zinc-400 text-zinc-900";
    const buttonPrimary = "flex-1 md:flex-none inline-flex items-center justify-center px-10 py-3.5 rounded-xl text-base font-bold bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-70 transition-all active:scale-[0.98] gap-2 shadow-sm";
    const buttonSecondary = "flex-1 md:flex-none inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-base font-bold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all gap-2";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                    <label className={labelClasses}>Código SKU</label>
                    <input
                        {...register("sku")}
                        placeholder="PROD-001"
                        className={cn(inputClasses, errors.sku && "border-red-200")}
                        disabled={!!product}
                    />
                    {errors.sku && <p className="text-sm text-red-500 mt-2 ml-1">{errors.sku.message}</p>}
                </div>

                <div className="flex flex-col">
                    <label className={labelClasses}>Nombre</label>
                    <input {...register("name")} placeholder="Nombre del producto" className={cn(inputClasses, errors.name && "border-red-200")} />
                    {errors.name && <p className="text-sm text-red-500 mt-2 ml-1">{errors.name.message}</p>}
                </div>
            </div>

            <div className="flex flex-col">
                <label className={labelClasses}>Descripción</label>
                <textarea {...register("description")} rows={5} placeholder="Detalles técnicos..." className={cn(inputClasses, "resize-none")} />
            </div>

            {/* Imagen */}
            <div className="flex flex-col">
                <label className={labelClasses}>Imagen del producto</label>
                <div className="flex items-start gap-4">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "w-28 h-28 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden shrink-0 transition-all",
                            uploading ? "opacity-60 cursor-wait" : "hover:border-zinc-400 hover:bg-zinc-50",
                            imageUrl ? "border-zinc-300 bg-white" : "border-zinc-200 bg-zinc-50"
                        )}
                    >
                        {uploading ? (
                            <Loader2 size={24} className="text-zinc-400 animate-spin" />
                        ) : imageUrl ? (
                            <div className="relative w-full h-full">
                                <Image src={imageUrl} alt="Preview" fill className="object-contain p-2" unoptimized />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-1 text-zinc-400">
                                <ImagePlus size={22} />
                                <span className="text-xs font-bold uppercase tracking-wider">Subir</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 bg-white text-sm font-bold text-zinc-600 hover:bg-zinc-50 hover:border-zinc-400 disabled:opacity-60 transition-all"
                        >
                            <ImagePlus size={15} />
                            {imageUrl ? "Cambiar imagen" : "Subir imagen"}
                        </button>
                        {imageUrl && (
                            <button
                                type="button"
                                onClick={() => setImageUrl("")}
                                className="text-xs text-red-500 hover:text-red-700 text-left transition-colors"
                            >
                                Quitar imagen
                            </button>
                        )}
                        <p className="text-xs text-zinc-400">JPG, PNG o WebP · máx. 5 MB</p>
                        {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
                    </div>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                    <label className={labelClasses}>Precio (USD)</label>
                    <input {...register("price")} type="number" step="0.01" className={inputClasses} />
                    {errors.price && <p className="text-sm text-red-500 mt-2 ml-1">{errors.price.message}</p>}
                </div>

                {!product && (
                    <div className="flex flex-col">
                        <label className={labelClasses}>Stock Inicial</label>
                        <input {...register("stock")} type="number" className={inputClasses} />
                        {errors.stock && <p className="text-sm text-red-500 mt-2 ml-1">{errors.stock.message}</p>}
                    </div>
                )}
            </div>

            <div className="flex flex-col">
                <label className={labelClasses}>Categoría</label>
                <input {...register("category")} placeholder="Seguridad, Alarmas..." className={inputClasses} />
                {errors.category && <p className="text-sm text-red-500 mt-2 ml-1">{errors.category.message}</p>}
            </div>

            {/* Venta por caja */}
            <div className="border border-zinc-200 rounded-2xl p-5 space-y-5">
                <div>
                    <h3 className="text-sm font-black text-zinc-800 uppercase tracking-widest">Venta por caja</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Dejá vacío si solo se vende por unidad.</p>
                </div>
                <div className="flex flex-col">
                    <label className={labelClasses}>Unidades por caja</label>
                    <input
                        {...register("unitsPerBox")}
                        type="number"
                        min="1"
                        placeholder="Ej: 10"
                        className={inputClasses}
                    />
                    {errors.unitsPerBox && <p className="text-sm text-red-500 mt-2 ml-1">{errors.unitsPerBox.message}</p>}
                </div>
            </div>

            {/* Venta por encargo */}
            <div className="border border-zinc-200 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-black text-zinc-800 uppercase tracking-widest flex items-center gap-2">
                            <ClipboardList size={14} className="text-zinc-500" />
                            Venta por encargo
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            El cliente puede pedirlo aunque no haya stock disponible.<br />
                            El stock no se descuenta al confirmar la orden.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setValue("isMadeToOrder", !isMadeToOrderValue)}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                            isMadeToOrderValue ? "bg-zinc-900" : "bg-zinc-200"
                        }`}
                        aria-pressed={isMadeToOrderValue}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            isMadeToOrderValue ? "translate-x-6" : "translate-x-1"
                        }`} />
                    </button>
                </div>
                <input type="hidden" {...register("isMadeToOrder")} />
            </div>

            {/* Visible en tienda */}
            <div className="border border-zinc-200 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-black text-zinc-800 uppercase tracking-widest flex items-center gap-2">
                            <Store size={14} className="text-zinc-500" />
                            Visible en tienda
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            Si está desactivado, el producto no aparece en la tienda online.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setValue("showInStore", !showInStoreValue)}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                            showInStoreValue ? "bg-zinc-900" : "bg-zinc-200"
                        }`}
                        aria-pressed={showInStoreValue}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            showInStoreValue ? "translate-x-6" : "translate-x-1"
                        }`} />
                    </button>
                </div>
                <input type="hidden" {...register("showInStore")} />
            </div>

            {/* Oferta */}
            <div className="border border-rose-100 bg-rose-50/40 rounded-2xl p-5 space-y-5">
                <div>
                    <h3 className="text-sm font-black text-rose-700 uppercase tracking-widest flex items-center gap-2">
                        <TrendingDown size={14} />
                        Oferta
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Dejá vacío si no hay oferta activa.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <label className={labelClasses}>Descuento (%)</label>
                        <div className="relative">
                            <input
                                {...register("offerDiscountPct")}
                                type="number"
                                min="1"
                                max="99"
                                step="1"
                                placeholder="Ej: 15"
                                className={cn(inputClasses, "pr-10")}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm pointer-events-none">%</span>
                        </div>
                        {errors.offerDiscountPct && <p className="text-sm text-red-500 mt-2 ml-1">{errors.offerDiscountPct.message}</p>}
                    </div>
                    <div className="flex flex-col">
                        <label className={labelClasses}>Aplica a</label>
                        <select {...register("offerUnit")} className={inputClasses}>
                            <option value="">— Sin oferta —</option>
                            <option value="unit">Por unidad</option>
                            {!!unitsPerBoxValue && <option value="box">Por caja</option>}
                        </select>
                    </div>
                </div>

                {/* Preview en vivo */}
                {offerPreview && (
                    <div className="bg-white border border-rose-100 rounded-xl p-4 space-y-3">
                        <p className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
                            <Info size={10} />
                            Preview de la oferta {offerUnit === "box" ? "(por caja)" : "(por unidad)"}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-0.5">
                                <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Precio regular</p>
                                <p className="text-base font-black text-zinc-400 line-through">{fmtArs(offerPreview.regularPriceArs)}</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs text-rose-500 uppercase tracking-wider font-bold">Precio con oferta</p>
                                <p className="text-base font-black text-rose-600">{fmtArs(offerPreview.offerPriceArs)}</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Ganancia regular</p>
                                <p className={cn("text-sm font-black", offerPreview.regularProfitArs >= 0 ? "text-emerald-600" : "text-red-500")}>
                                    {fmtArs(offerPreview.regularProfitArs)}
                                </p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Ganancia en oferta</p>
                                <p className={cn("text-sm font-black", offerPreview.offerProfitArs >= 0 ? "text-emerald-600" : "text-red-500")}>
                                    {fmtArs(offerPreview.offerProfitArs)}
                                    {offerPreview.offerProfitArs < 0 && <span className="text-xs ml-1 font-bold text-red-400">¡Pérdida!</span>}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {serverError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                    {serverError}
                </div>
            )}

            <div className="flex flex-col-reverse md:flex-row gap-3 pt-8 border-t border-zinc-50">
                <button type="button" onClick={() => router.back()} className={buttonSecondary}>
                    <X className="w-4 h-4" /> Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className={buttonPrimary}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {product ? "Guardar Cambios" : "Crear Producto"}
                </button>
            </div>
        </form>
    );
}
