'use client'

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, X } from "lucide-react";
import { cn, preventEnterSubmit } from "@/lib/utils";
import { createExpense } from "@/actions/expenses";
import { ExpenseFormData, ExpenseFormInput, expenseSchema } from "@/lib/validations/expense";

export function ExpenseForm() {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ExpenseFormInput, unknown, ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            type: "PURCHASE",
            date: new Date().toISOString().split("T")[0],
        },
    });

    const type = watch("type");

    const onSubmit = async (data: ExpenseFormData) => {
        setServerError(null);
        try {
            await createExpense(data);
            router.push("/admin/expenses");
            router.refresh();
        } catch {
            setServerError("Error al registrar el gasto.");
        }
    };

    const labelClasses = "text-xs font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2 ml-1 block";
    const inputClasses = "w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-base transition-all outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 placeholder:text-zinc-400 text-zinc-900";
    const btnPrimary = "flex-1 md:flex-none inline-flex items-center justify-center px-10 py-3.5 rounded-xl text-base font-bold bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-70 transition-all active:scale-[0.98] gap-2 shadow-sm";
    const btnSecondary = "flex-1 md:flex-none inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-base font-bold text-zinc-500 hover:bg-zinc-100 transition-all gap-2";

    return (
        <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* Tipo de gasto */}
            <div className="flex flex-col">
                <label className={labelClasses}>Tipo de gasto</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {([
                        { value: "PURCHASE", label: "Compra", desc: "Mercadería al proveedor (USD)" },
                        { value: "SHIPPING", label: "Envío", desc: "Flete BsAs → Salta (ARS)" },
                        { value: "ADVERTISING", label: "Publicidad", desc: "MercadoLibre, redes, etc. (ARS)" },
                        { value: "OTHER", label: "Otro", desc: "Gastos varios (ARS)" },
                    ] as const).map((opt) => (
                        <label
                            key={opt.value}
                            className={cn(
                                "flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all",
                                type === opt.value
                                    ? "border-zinc-900 bg-zinc-900 text-white"
                                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
                            )}
                        >
                            <input {...register("type")} type="radio" value={opt.value} className="sr-only" />
                            <span className="font-bold text-sm">{opt.label}</span>
                            <span className={cn("text-xs mt-0.5", type === opt.value ? "text-zinc-400" : "text-zinc-400")}>{opt.desc}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Descripción */}
            <div className="flex flex-col">
                <label className={labelClasses}>Descripción</label>
                <input
                    {...register("description")}
                    placeholder={type === "PURCHASE" ? "Compra lote cámaras IP — factura #123" : type === "SHIPPING" ? "Flete Andreani marzo" : type === "ADVERTISING" ? "Publicidad MercadoLibre abril" : "Gasto varios"}
                    className={cn(inputClasses, errors.description && "border-red-200")}
                />
                {errors.description && <p className="text-sm text-red-500 mt-2 ml-1">{errors.description.message}</p>}
            </div>

            {/* Monto según tipo */}
            {type === "PURCHASE" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <label className={labelClasses}>Monto (USD)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">USD</span>
                            <input
                                {...register("amountUsd")}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className={cn(inputClasses, "pl-14", errors.amountUsd && "border-red-200")}
                            />
                        </div>
                        {errors.amountUsd && <p className="text-sm text-red-500 mt-2 ml-1">{errors.amountUsd.message}</p>}
                    </div>
                    <div className="flex flex-col">
                        <label className={labelClasses}>Cotización del día (ARS/USD)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">$</span>
                            <input
                                {...register("dollarRate")}
                                type="number"
                                step="0.01"
                                placeholder="1200.00"
                                className={cn(inputClasses, "pl-8")}
                            />
                        </div>
                        {errors.dollarRate
                            ? <p className="text-sm text-red-500 mt-2 ml-1">{errors.dollarRate.message}</p>
                            : <p className="text-xs text-zinc-400 mt-2 ml-1">Opcional, para cálculo de P&L en ARS</p>
                        }
                    </div>
                </div>
            ) : (
                <div className="flex flex-col max-w-xs">
                    <label className={labelClasses}>Monto (ARS)</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">$</span>
                        <input
                            {...register("amountArs")}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className={cn(inputClasses, "pl-8", errors.amountArs && "border-red-200")}
                        />
                    </div>
                    {errors.amountArs && <p className="text-sm text-red-500 mt-2 ml-1">{errors.amountArs.message}</p>}
                </div>
            )}

            {/* Fecha */}
            <div className="flex flex-col max-w-xs">
                <label className={labelClasses}>Fecha</label>
                <input
                    {...register("date")}
                    type="date"
                    className={cn(inputClasses, errors.date && "border-red-200")}
                />
                {errors.date && <p className="text-sm text-red-500 mt-2 ml-1">{errors.date.message}</p>}
            </div>

            {/* Notas */}
            <div className="flex flex-col">
                <label className={labelClasses}>Notas (opcional)</label>
                <textarea
                    {...register("notes")}
                    rows={2}
                    placeholder="Detalles adicionales..."
                    className={cn(inputClasses, "resize-none")}
                />
            </div>

            {errors.root && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                    {errors.root.message}
                </div>
            )}

            {serverError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                    {serverError}
                </div>
            )}

            <div className="flex flex-col-reverse md:flex-row gap-3 pt-8 border-t border-zinc-100">
                <button type="button" onClick={() => router.back()} className={btnSecondary}>
                    <X className="w-4 h-4" /> Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className={btnPrimary}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Registrar Gasto
                </button>
            </div>
        </form>
    );
}
