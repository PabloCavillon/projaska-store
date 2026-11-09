'use client';


import { preventEnterSubmit } from "@/lib/utils";
import { createStockMovement } from "@/actions/stock";
import { StockMovementFormData, StockMovementFormInput, stockMovementSchema } from "@/lib/validations/stock";
import { SerializedProduct } from "@/types/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function StockMovementForm({ products }: { products: SerializedProduct[] }) {

    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<StockMovementFormInput, unknown, StockMovementFormData>({
        resolver: zodResolver(stockMovementSchema),
        defaultValues: {
            productId: '',
            type: 'IN',
            quantity: 1,
            reason: ''
        }
    });

    const onSubmit = async (data: StockMovementFormData) => {
        setServerError(null);
        setSuccess(false);
        try {
            await createStockMovement(data)
            reset()
            setSuccess(true)
            router.refresh()
        } catch {
            setServerError("Algo salió mal. Por favor intente de nuevo.")
        }
    }

    const labelClass = "text-xs font-bold text-zinc-600 uppercase tracking-wider ml-1";
    const inputClass = "w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-base text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all placeholder:text-zinc-400";

    return (
        <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onSubmit)} className="space-y-5 flex flex-col">

            <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Producto</label>
                <select {...register("productId")} className={`${inputClass} appearance-none`}>
                    <option value="">Seleccionar producto...</option>
                    {products.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name} (Stock actual: {p.stock})
                        </option>
                    ))}
                </select>
                {errors.productId && <p className="text-sm font-medium text-red-500 ml-1">{errors.productId.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Tipo de Movimiento</label>
                <select {...register("type")} className={inputClass}>
                    <option value="IN">ENTRADA — Ingreso de stock</option>
                    <option value="OUT">SALIDA — Egreso de stock</option>
                </select>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Cantidad</label>
                <input
                    {...register("quantity")}
                    type="number"
                    min="1"
                    placeholder="0"
                    className={inputClass}
                />
                {errors.quantity && <p className="text-sm font-medium text-red-500 ml-1">{errors.quantity.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={labelClass}>
                    Motivo <span className="lowercase opacity-50 font-normal">(opcional)</span>
                </label>
                <input
                    {...register("reason")}
                    placeholder="Ej: Compra, Pérdida, Ajuste..."
                    className={inputClass}
                />
            </div>

            {(serverError || success) && (
                <div className={`p-3 rounded-xl text-sm font-medium ${serverError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                    {serverError || "Movimiento registrado con éxito."}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl text-base font-bold hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-sm"
            >
                {isSubmitting ? "Guardando..." : "Registrar Movimiento"}
            </button>
        </form>
    );
}