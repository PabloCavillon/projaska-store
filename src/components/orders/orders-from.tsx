'use client';


import { preventEnterSubmit } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { type OrderFormData, type OrderFormInput, orderSchema } from "@/lib/validations/order";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrder } from "@/actions/orders";
import type { SerializedProduct } from "@/types/product";
import { SerializedCustomer } from "@/types/customer";
import Combobox from "../ui/combobox";

export function OrderForm({ customers, products }: { customers: SerializedCustomer[], products: SerializedProduct[] }) {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<OrderFormInput, unknown, OrderFormData>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            customerId: "",
            notes: "",
            items: [{ productId: "", quantity: 1, unitPrice: 0 }]
        }
    })

    const { fields, append, remove } = useFieldArray({ control, name: "items" });
    const watchedItems = watch("items");

    const total = watchedItems.reduce((acc, item) => {
        const product = products.find((p) => p.id === item.productId)
        const price = product ? product.price : Number(item.unitPrice) || 0
        return acc + price * (Number(item.quantity) || 0)
    }, 0);

    const handleProductChange = (index: number, productId: string) => {
        const product = products.find((p) => p.id === productId)
        if (product) {
            setValue(`items.${index}.unitPrice`, product.price, { shouldValidate: true })
        } else {
            setValue(`items.${index}.unitPrice`, 0, { shouldValidate: true })
        }
    }

    const onSubmit = async (data: OrderFormData) => {
        setServerError(null);
        try {
            await createOrder(data);
            router.push("/admin/orders");
            router.refresh();
        } catch {
            setServerError("Algo salió mal. Por favor intente de nuevo")
        }
    }

    const labelClasses = "text-xs font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2 ml-1 block";
    const inputClasses = "w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-base text-zinc-900 transition-all outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 placeholder:text-zinc-400";

    return (
        <form onKeyDown={preventEnterSubmit} className="space-y-8" onSubmit={handleSubmit(onSubmit)}>

            {/* Cliente */}
            <div className="flex flex-col">
                <label className={labelClasses}>Seleccionar Cliente</label>
                <Combobox
                    options={customers.map((c) => ({
                        value: c.id,
                        label: c.name,
                        sublabel: c.email ?? undefined,
                    }))}
                    value={watch("customerId")}
                    onChange={(val) => setValue("customerId", val, { shouldValidate: true })}
                    placeholder="Elegir cliente..."
                    searchPlaceholder="Buscar por nombre o email..."
                    emptyMessage="No se encontraron clientes."
                />
                {errors.customerId && <p className="text-sm text-red-500 mt-1 ml-1">{errors.customerId.message}</p>}
            </div>

            {/* Items */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <label className={labelClasses}>Productos en la Orden</label>
                    <button
                        type="button"
                        onClick={() => append({ productId: "", quantity: 1, unitPrice: 0 })}
                        className="text-xs font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-1 hover:underline"
                    >
                        <Plus className="w-3.5 h-3.5" /> Agregar Ítem
                    </button>
                </div>

                {errors.items?.root && (
                    <p className="text-sm text-red-500 ml-1">{errors.items.root.message}</p>
                )}

                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex flex-col md:flex-row gap-3 p-2 bg-zinc-50 rounded-2xl border border-zinc-200">
                            <div className="flex-1">
                                <Combobox
                                    options={products.map((p) => ({
                                        value: p.id,
                                        label: p.name,
                                        sublabel: `#${p.sku} · stock: ${p.stock}`,
                                    }))}
                                    value={watch(`items.${index}.productId`)}
                                    onChange={(val) => {
                                        setValue(`items.${index}.productId`, val, { shouldValidate: true });
                                        handleProductChange(index, val);
                                    }}
                                    placeholder="Producto..."
                                    searchPlaceholder="Buscar por nombre o SKU..."
                                    emptyMessage="No se encontraron productos."
                                />
                                {errors.items?.[index]?.productId && (
                                    <p className="text-sm text-red-500 mt-1 ml-1">
                                        {errors.items[index].productId?.message}
                                    </p>
                                )}
                            </div>
                            <div className="w-full md:w-32">
                                <input
                                    type="number"
                                    placeholder="Cantidad"
                                    className={inputClasses}
                                    min="1"
                                    {...register(`items.${index}.quantity`)}
                                />
                            </div>
                            {fields.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="self-center p-3 text-zinc-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}

                    {fields.length === 0 && (
                        <div className="text-center py-10 border-2 border-dashed border-zinc-200 rounded-2xl">
                            <p className="text-sm text-zinc-400 uppercase tracking-widest font-medium">
                                No hay productos seleccionados
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Notas */}
            <div className="flex flex-col">
                <label className={labelClasses}>
                    Notas <span className="normal-case text-zinc-400 font-normal">(opcional)</span>
                </label>
                <textarea
                    {...register("notes")}
                    rows={2}
                    className={`${inputClasses} resize-none`}
                />
            </div>

            {/* Total */}
            <div className="flex items-center justify-between py-4 border-t border-zinc-100">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total</span>
                <span className="text-xl font-bold text-zinc-900">${total.toFixed(2)}</span>
            </div>

            {serverError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                    {serverError}
                </div>
            )}

            {/* Acciones */}
            <div className="flex flex-col-reverse md:flex-row gap-3 pt-6 border-t border-zinc-100">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 md:flex-none inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-base font-bold text-zinc-500 hover:bg-zinc-100 transition-all gap-2"
                >
                    <X className="w-4 h-4" /> Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 md:flex-none inline-flex items-center justify-center px-10 py-3.5 rounded-xl text-base font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm gap-2"
                >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? "Creando..." : "Finalizar Orden"}
                </button>
            </div>
        </form>
    );
}