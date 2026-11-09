'use client'

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Loader2, Save, DollarSign, Truck, TrendingUp, Tag, BarChart2, RefreshCw } from "lucide-react";
import { cn, preventEnterSubmit } from "@/lib/utils";
import { fetchOfficialDollarRate, updatePriceConfig } from "@/actions/config";
import { PriceConfigFormData, PriceConfigFormInput, priceConfigSchema } from "@/lib/validations/config";
import { SerializedPriceConfig } from "@/actions/config";

interface PriceConfigFormProps {
    config: SerializedPriceConfig;
}

export function PriceConfigForm({ config }: PriceConfigFormProps) {
    const [serverError, setServerError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [fetchingRate, setFetchingRate] = useState(false);
    const [rateInfo, setRateInfo] = useState<{ compra: number; venta: number; updatedAt: string } | null>(null);
    const [rateError, setRateError] = useState<string | null>(null);

    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<PriceConfigFormInput, unknown, PriceConfigFormData>({
        resolver: zodResolver(priceConfigSchema),
        defaultValues: {
            dollarRate: config.dollarRate,
            shippingPct: config.shippingPct,
            profitPct: config.profitPct,
            guildDiscountPct: config.guildDiscountPct,
            volumeDiscountPct: config.volumeDiscountPct,
            volumeThresholdArs: config.volumeThresholdArs,
        },
    });

    const values = watch();

    // Preview: precio de venta en ARS para un producto de 1 USD
    const n = (v: unknown) => Number(v) || 0;
    const baseArs = n(values.dollarRate);
    const withMarkups = baseArs * (1 + n(values.shippingPct) / 100) * (1 + n(values.profitPct) / 100);
    const withGuild = withMarkups * (1 - n(values.guildDiscountPct) / 100);
    const withVolume = withMarkups * (1 - n(values.volumeDiscountPct) / 100);

    const fmt = (n: number) =>
        n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

    const handleFetchRate = async () => {
        setFetchingRate(true);
        setRateError(null);
        setRateInfo(null);
        const result = await fetchOfficialDollarRate();
        setFetchingRate(false);
        if ("error" in result) {
            setRateError(result.error);
        } else {
            setValue("dollarRate", result.average);
            setRateInfo({ compra: result.compra, venta: result.venta, updatedAt: result.updatedAt });
        }
    };

    const onSubmit = async (data: PriceConfigFormData) => {
        setServerError(null);
        setSaved(false);
        try {
            await updatePriceConfig(data);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch {
            setServerError("Error al guardar la configuración.");
        }
    };

    const labelClasses = "text-xs font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2 ml-1 block";
    const inputClasses = "w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-base transition-all outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 disabled:bg-zinc-50 placeholder:text-zinc-400 text-zinc-900";
    const sectionClasses = "bg-white rounded-2xl border border-zinc-200 p-6 space-y-6";
    const sectionTitleClasses = "flex items-center gap-2 text-sm font-black text-zinc-900 uppercase tracking-widest mb-6 pb-4 border-b border-zinc-100";

    return (
        <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Cotización del dólar */}
            <div className={sectionClasses}>
                <p className={sectionTitleClasses}>
                    <DollarSign size={16} className="text-zinc-400" />
                    Cotización del dólar oficial
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="w-full sm:max-w-xs">
                        <label className={labelClasses}>ARS por USD (promedio compra/venta)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">$</span>
                            <input
                                {...register("dollarRate")}
                                type="number"
                                step="0.01"
                                placeholder="1200.00"
                                className={cn(inputClasses, "pl-8", errors.dollarRate && "border-red-200")}
                            />
                        </div>
                        {errors.dollarRate && <p className="text-sm text-red-500 mt-2 ml-1">{errors.dollarRate.message}</p>}
                    </div>
                    <div className="sm:pt-7">
                        <button
                            type="button"
                            onClick={handleFetchRate}
                            disabled={fetchingRate}
                            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-zinc-300 bg-white text-sm font-bold text-zinc-600 hover:bg-zinc-50 hover:border-zinc-400 disabled:opacity-60 transition-all whitespace-nowrap"
                        >
                            {fetchingRate
                                ? <Loader2 size={14} className="animate-spin" />
                                : <RefreshCw size={14} />
                            }
                            Obtener cotización actual
                        </button>
                    </div>
                </div>

                {rateInfo && (
                    <div className="flex flex-wrap gap-4 mt-1">
                        <div className="text-xs text-zinc-500 bg-zinc-50 rounded-xl px-4 py-2.5 space-y-0.5">
                            <p className="font-black text-zinc-400 uppercase tracking-widest text-xs">Compra</p>
                            <p className="font-bold text-zinc-700">${rateInfo.compra.toLocaleString("es-AR")}</p>
                        </div>
                        <div className="text-xs text-zinc-500 bg-zinc-50 rounded-xl px-4 py-2.5 space-y-0.5">
                            <p className="font-black text-zinc-400 uppercase tracking-widest text-xs">Venta</p>
                            <p className="font-bold text-zinc-700">${rateInfo.venta.toLocaleString("es-AR")}</p>
                        </div>
                        <div className="text-xs text-zinc-500 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 space-y-0.5">
                            <p className="font-black text-emerald-600 uppercase tracking-widest text-xs">Promedio aplicado</p>
                            <p className="font-bold text-emerald-700">${((rateInfo.compra + rateInfo.venta) / 2).toLocaleString("es-AR", { maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className="text-xs text-zinc-500 bg-zinc-50 rounded-xl px-4 py-2.5 space-y-0.5">
                            <p className="font-black text-zinc-400 uppercase tracking-widest text-xs">Actualizado</p>
                            <p className="font-bold text-zinc-700">{new Date(rateInfo.updatedAt).toLocaleString("es-AR")}</p>
                        </div>
                    </div>
                )}

                {rateError && (
                    <p className="text-sm text-red-500 mt-1">{rateError}</p>
                )}
            </div>

            {/* Markups de venta */}
            <div className={sectionClasses}>
                <p className={sectionTitleClasses}>
                    <TrendingUp size={16} className="text-zinc-400" />
                    Markups de precio de venta
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <label className={labelClasses}>
                            <Truck size={12} className="inline mr-1" />
                            % Cobertura de envío (BsAs → Salta)
                        </label>
                        <div className="relative">
                            <input
                                {...register("shippingPct")}
                                type="number"
                                step="0.1"
                                placeholder="5"
                                className={cn(inputClasses, "pr-10", errors.shippingPct && "border-red-200")}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">%</span>
                        </div>
                        {errors.shippingPct && <p className="text-sm text-red-500 mt-2 ml-1">{errors.shippingPct.message}</p>}
                    </div>

                    <div className="flex flex-col">
                        <label className={labelClasses}>
                            <TrendingUp size={12} className="inline mr-1" />
                            % Ganancia
                        </label>
                        <div className="relative">
                            <input
                                {...register("profitPct")}
                                type="number"
                                step="0.1"
                                placeholder="20"
                                className={cn(inputClasses, "pr-10", errors.profitPct && "border-red-200")}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">%</span>
                        </div>
                        {errors.profitPct && <p className="text-sm text-red-500 mt-2 ml-1">{errors.profitPct.message}</p>}
                    </div>
                </div>
            </div>

            {/* Descuentos */}
            <div className={sectionClasses}>
                <p className={sectionTitleClasses}>
                    <Tag size={16} className="text-zinc-400" />
                    Descuentos
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col">
                        <label className={labelClasses}>% Descuento gremio</label>
                        <div className="relative">
                            <input
                                {...register("guildDiscountPct")}
                                type="number"
                                step="0.1"
                                placeholder="10"
                                className={cn(inputClasses, "pr-10", errors.guildDiscountPct && "border-red-200")}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">%</span>
                        </div>
                        {errors.guildDiscountPct && <p className="text-sm text-red-500 mt-2 ml-1">{errors.guildDiscountPct.message}</p>}
                        <p className="text-xs text-zinc-400 mt-2 ml-1">Aplica a clientes marcados como "gremio"</p>
                    </div>

                    <div className="flex flex-col">
                        <label className={labelClasses}>% Descuento por volumen</label>
                        <div className="relative">
                            <input
                                {...register("volumeDiscountPct")}
                                type="number"
                                step="0.1"
                                placeholder="10"
                                className={cn(inputClasses, "pr-10", errors.volumeDiscountPct && "border-red-200")}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">%</span>
                        </div>
                        {errors.volumeDiscountPct && <p className="text-sm text-red-500 mt-2 ml-1">{errors.volumeDiscountPct.message}</p>}
                        <p className="text-xs text-zinc-400 mt-2 ml-1">Aplica cuando la orden supera el umbral</p>
                    </div>

                    <div className="flex flex-col">
                        <label className={labelClasses}>Umbral de volumen (ARS)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">$</span>
                            <input
                                {...register("volumeThresholdArs")}
                                type="number"
                                step="1000"
                                placeholder="1000000"
                                className={cn(inputClasses, "pl-8", errors.volumeThresholdArs && "border-red-200")}
                            />
                        </div>
                        {errors.volumeThresholdArs && <p className="text-sm text-red-500 mt-2 ml-1">{errors.volumeThresholdArs.message}</p>}
                        <p className="text-xs text-zinc-400 mt-2 ml-1">Monto total de la orden en pesos</p>
                    </div>
                </div>
                <p className="text-xs text-zinc-400 bg-zinc-50 rounded-xl px-4 py-3">
                    Los descuentos no se acumulan — se aplica el mayor entre gremio y volumen.
                </p>
            </div>

            {/* Preview de precios */}
            <div className="bg-zinc-900 rounded-2xl p-6 text-white space-y-4">
                <p className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-zinc-400">
                    <BarChart2 size={16} />
                    Preview — producto de USD 1.00
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Precio lista</p>
                        <p className="text-xl font-black">{fmt(withMarkups)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Con dto. gremio</p>
                        <p className="text-xl font-black text-emerald-400">{fmt(withGuild)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Con dto. volumen</p>
                        <p className="text-xl font-black text-emerald-400">{fmt(withVolume)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Umbral volumen</p>
                        <p className="text-xl font-black">{fmt(n(values.volumeThresholdArs))}</p>
                    </div>
                </div>
                <p className="text-xs text-zinc-600">
                    Fórmula: USD × cotización × (1 + %envío) × (1 + %ganancia)
                </p>
            </div>

            {serverError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                    {serverError}
                </div>
            )}

            {saved && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-medium">
                    Configuración guardada correctamente.
                </div>
            )}

            <div className="flex justify-end pt-2">
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-10 py-3.5 rounded-xl text-base font-bold hover:bg-zinc-800 disabled:opacity-70 transition-all active:scale-[0.98] shadow-sm">
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Guardar configuración
                </button>
            </div>

            {config.updatedBy && (
                <p className="text-xs text-zinc-400 text-right">
                    Última actualización por <strong>{config.updatedBy.username}</strong> · {new Date(config.updatedAt).toLocaleString("es-AR")}
                </p>
            )}
        </form>
    );
}
