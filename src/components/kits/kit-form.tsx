'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createKit, updateKit } from "@/actions/kits";
import { KitFormData, KitFormInput, kitSchema } from "@/lib/validations/kit";
import { SerializedKit } from "@/types/kit";
import { SerializedProduct } from "@/types/product";
import { ImagePlus, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Combobox from "@/components/ui/combobox";
import { useRef } from "react";

type Props = {
    kit?: SerializedKit;
    products: SerializedProduct[];
    kits: SerializedKit[]; // for sub-kit selection
};

export function KitForm({ kit, products, kits }: Props) {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string>(kit?.imageUrl ?? "");
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const defaultItems = kit?.items.map((i) => ({
        productId: i.productId ?? undefined,
        childKitId: i.childKitId ?? undefined,
        quantity: i.quantity,
    })) ?? [{ productId: undefined, childKitId: undefined, quantity: 1 }];

    const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } =
        useForm<KitFormInput, unknown, KitFormData>({
            resolver: zodResolver(kitSchema),
            defaultValues: {
                sku: kit?.sku ?? "",
                name: kit?.name ?? "",
                description: kit?.description ?? "",
                imageUrl: kit?.imageUrl ?? "",
                price: kit ? Number(kit.price) : undefined,
                isActive: kit?.isActive ?? true,
                items: defaultItems,
            },
        });

    const { fields, append, remove } = useFieldArray({ control, name: "items" });

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

    const onSubmit = async (data: KitFormData) => {
        setServerError(null);
        try {
            const payload = { ...data, imageUrl: imageUrl || undefined };
            if (kit) await updateKit(kit.id, payload);
            else await createKit(payload);
            router.push("/admin/kits");
            router.refresh();
        } catch {
            setServerError("Error al guardar el kit.");
        }
    };

    // Available kits for sub-kit selection (exclude the current kit to prevent circular refs)
    const availableKits = kits.filter((k) => k.id !== kit?.id);

    const labelClasses = "text-xs font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2 ml-1 block";
    const inputClasses = "w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-base transition-all outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 disabled:bg-zinc-50 placeholder:text-zinc-400 text-zinc-900";
    const buttonPrimary = "flex-1 md:flex-none inline-flex items-center justify-center px-10 py-3.5 rounded-xl text-base font-bold bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-70 transition-all active:scale-[0.98] gap-2 shadow-sm";
    const buttonSecondary = "flex-1 md:flex-none inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-base font-bold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all gap-2";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* SKU + Nombre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                    <label className={labelClasses}>Código SKU</label>
                    <input
                        {...register("sku")}
                        placeholder="KIT-001"
                        className={cn(inputClasses, errors.sku && "border-red-200")}
                        disabled={!!kit}
                    />
                    {errors.sku && <p className="text-sm text-red-500 mt-2 ml-1">{errors.sku.message}</p>}
                </div>
                <div className="flex flex-col">
                    <label className={labelClasses}>Nombre</label>
                    <input {...register("name")} placeholder="Nombre del kit" className={cn(inputClasses, errors.name && "border-red-200")} />
                    {errors.name && <p className="text-sm text-red-500 mt-2 ml-1">{errors.name.message}</p>}
                </div>
            </div>

            {/* Descripción */}
            <div className="flex flex-col">
                <label className={labelClasses}>Descripción</label>
                <textarea {...register("description")} rows={2} placeholder="Descripción del kit..." className={cn(inputClasses, "resize-none")} />
            </div>

            {/* Imagen */}
            <div className="flex flex-col">
                <label className={labelClasses}>Imagen del kit</label>
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
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 bg-white text-sm font-bold text-zinc-600 hover:bg-zinc-50 hover:border-zinc-400 disabled:opacity-60 transition-all">
                            <ImagePlus size={15} />
                            {imageUrl ? "Cambiar imagen" : "Subir imagen"}
                        </button>
                        {imageUrl && (
                            <button type="button" onClick={() => setImageUrl("")} className="text-xs text-red-500 hover:text-red-700 text-left transition-colors">
                                Quitar imagen
                            </button>
                        )}
                        <p className="text-xs text-zinc-400">JPG, PNG o WebP · máx. 5 MB</p>
                        {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
                    </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
            </div>

            {/* Precio + Activo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                    <label className={labelClasses}>Precio (USD)</label>
                    <input {...register("price")} type="number" step="0.01" className={cn(inputClasses, errors.price && "border-red-200")} />
                    {errors.price && <p className="text-sm text-red-500 mt-2 ml-1">{errors.price.message}</p>}
                </div>
                <div className="flex flex-col justify-center">
                    <label className={labelClasses}>Disponible en tienda</label>
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                        <div className="relative">
                            <input type="checkbox" className="sr-only peer" {...register("isActive")} />
                            <div className="w-11 h-6 bg-zinc-200 rounded-full peer peer-checked:bg-zinc-900 transition-colors" />
                            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                        </div>
                        <span className="text-sm font-medium text-zinc-600">
                            {watch("isActive") ? "Activo" : "Inactivo"}
                        </span>
                    </label>
                </div>
            </div>

            {/* Items del kit */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <label className={labelClasses}>Contenido del kit</label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => append({ productId: undefined, childKitId: undefined, quantity: 1 })}
                            className="text-xs font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-1 hover:underline"
                        >
                            <Plus className="w-3.5 h-3.5" /> Agregar producto
                        </button>
                        {availableKits.length > 0 && (
                            <>
                                <span className="text-zinc-300">·</span>
                                <button
                                    type="button"
                                    onClick={() => append({ productId: undefined, childKitId: "", quantity: 1 })}
                                    className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1 hover:underline"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Agregar kit
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {errors.items?.root && (
                    <p className="text-sm text-red-500 ml-1">{errors.items.root.message}</p>
                )}

                <div className="space-y-3">
                    {fields.map((field, index) => {
                        const isKitRow = watch(`items.${index}.childKitId`) !== undefined &&
                            watch(`items.${index}.productId`) === undefined;

                        return (
                            <div key={field.id} className="flex flex-col md:flex-row gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
                                {/* Tipo badge */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className={cn(
                                        "text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-lg",
                                        isKitRow ? "bg-violet-100 text-violet-700" : "bg-blue-50 text-blue-700"
                                    )}>
                                        {isKitRow ? "Kit" : "Producto"}
                                    </span>
                                </div>

                                {/* Selector */}
                                <div className="flex-1">
                                    {isKitRow ? (
                                        <Combobox
                                            options={availableKits.map((k) => ({
                                                value: k.id,
                                                label: k.name,
                                                sublabel: `#${k.sku}`,
                                            }))}
                                            value={watch(`items.${index}.childKitId`) ?? ""}
                                            onChange={(val) => setValue(`items.${index}.childKitId`, val, { shouldValidate: true })}
                                            placeholder="Seleccionar kit..."
                                            searchPlaceholder="Buscar kit..."
                                            emptyMessage="No se encontraron kits."
                                        />
                                    ) : (
                                        <Combobox
                                            options={products.map((p) => ({
                                                value: p.id,
                                                label: p.name,
                                                sublabel: `#${p.sku} · stock: ${p.stock}`,
                                            }))}
                                            value={watch(`items.${index}.productId`) ?? ""}
                                            onChange={(val) => setValue(`items.${index}.productId`, val, { shouldValidate: true })}
                                            placeholder="Seleccionar producto..."
                                            searchPlaceholder="Buscar por nombre o SKU..."
                                            emptyMessage="No se encontraron productos."
                                        />
                                    )}
                                    {errors.items?.[index] && (
                                        <p className="text-sm text-red-500 mt-1 ml-1">
                                            {errors.items[index]?.productId?.message || errors.items[index]?.message}
                                        </p>
                                    )}
                                </div>

                                {/* Cantidad */}
                                <div className="w-full md:w-28">
                                    <input
                                        type="number"
                                        placeholder="Cant."
                                        min="1"
                                        className={inputClasses}
                                        {...register(`items.${index}.quantity`)}
                                    />
                                </div>

                                {/* Eliminar */}
                                {fields.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="self-center p-2.5 text-zinc-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    {fields.length === 0 && (
                        <div className="text-center py-10 border-2 border-dashed border-zinc-200 rounded-2xl">
                            <p className="text-sm text-zinc-400 uppercase tracking-widest font-medium">
                                El kit no tiene ítems
                            </p>
                        </div>
                    )}
                </div>
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
                    {kit ? "Guardar Cambios" : "Crear Kit"}
                </button>
            </div>
        </form>
    );
}
