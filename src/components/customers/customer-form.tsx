'use client'

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCustomer, updateCustomer } from "@/actions/customers";
import { CustomerFormData, CustomerFormInput, customerSchema } from '@/lib/validations/customer';
import { Loader2, Save, X } from "lucide-react";
import { cn, preventEnterSubmit } from "@/lib/utils";
import { SerializedCustomer } from "@/types/customer";

export function CustomerForm({ customer }: { customer?: SerializedCustomer }) {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);

    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<CustomerFormInput, unknown, CustomerFormData>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: customer?.name ?? '',
            email: customer?.email ?? '',
            phone: customer?.phone ?? '',
            address: customer?.address ?? '',
            isGuild: customer?.isGuild ?? false,
        }
    });

    const isGuild = watch('isGuild');

    const onSubmit = async (data: CustomerFormData) => {
        setServerError(null);
        try {
            if (customer) await updateCustomer(customer.id, data);
            else await createCustomer(data);
            router.push("/admin/customers");
            router.refresh();
        } catch {
            setServerError("Error al procesar el registro del cliente.");
        }
    };

    const labelClasses = "text-xs font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2 ml-1 block";
    const inputClasses = "w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-base transition-all outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 disabled:bg-zinc-50 placeholder:text-zinc-400 text-zinc-900";
    const btnPrimary = "flex-1 md:flex-none inline-flex items-center justify-center px-10 py-3.5 rounded-xl text-base font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-all active:scale-[0.98] gap-2 shadow-sm";
    const btnSecondary = "flex-1 md:flex-none inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-base font-bold text-zinc-500 hover:bg-zinc-100 transition-all gap-2";

    return (
        <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-col">
                <label className={labelClasses}>Nombre Completo / Razón Social</label>
                <input {...register("name")} placeholder="Juan Pérez o Projaska SRL" className={cn(inputClasses, errors.name && "border-red-200")} />
                {errors.name && <p className="text-sm text-red-500 mt-2 ml-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                    <label className={labelClasses}>Email</label>
                    <input {...register("email")} type="email" placeholder="cliente@correo.com" className={cn(inputClasses, errors.email && "border-red-200")} />
                    {errors.email && <p className="text-sm text-red-500 mt-2 ml-1">{errors.email.message}</p>}
                </div>

                <div className="flex flex-col">
                    <label className={labelClasses}>Teléfono</label>
                    <input {...register("phone")} placeholder="+54 387 ..." className={cn(inputClasses, errors.phone && "border-red-200")} />
                    {errors.phone && <p className="text-sm text-red-500 mt-2 ml-1">{errors.phone.message}</p>}
                </div>
            </div>

            <div className="flex flex-col">
                <label className={labelClasses}>Dirección</label>
                <input {...register("address")} placeholder="Calle, Número, Localidad" className={inputClasses} />
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                <div>
                    <p className="text-sm font-bold text-zinc-900">Cliente del gremio</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Aplica descuento de gremio en la tienda</p>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={isGuild}
                    onClick={() => setValue('isGuild', !isGuild, { shouldDirty: true })}
                    className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                        isGuild ? "bg-zinc-900" : "bg-zinc-300"
                    )}
                >
                    <span className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
                        isGuild ? "translate-x-6" : "translate-x-1"
                    )} />
                </button>
            </div>

            {serverError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium animate-in fade-in">
                    {serverError}
                </div>
            )}

            <div className="flex flex-col-reverse md:flex-row gap-3 pt-8 border-t border-zinc-100">
                <button type="button" onClick={() => router.back()} className={btnSecondary}>
                    <X className="w-4 h-4" /> Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className={btnPrimary}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {customer ? "Actualizar Perfil" : "Registrar Cliente"}
                </button>
            </div>
        </form>
    );
}