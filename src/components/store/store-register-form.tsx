"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/validations/store-auth";
import { Loader2 } from "lucide-react";

const labelClass = "vf-label";
const inputClass = "vf-input";

interface StoreRegisterFormProps {
    action: (data: RegisterFormData) => Promise<{ error: string } | { redirectTo: string }>;
    redirectTo?: string;
}

export default function StoreRegisterForm({ action, redirectTo }: StoreRegisterFormProps) {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "", redirect: redirectTo },
    });

    const onSubmit = async (data: RegisterFormData) => {
        setServerError(null);
        try {
            const result = await action(data);
            if ("error" in result) {
                setServerError(result.error);
            } else {
                router.push(result.redirectTo);
            }
        } catch {
            setServerError("Ocurrió un error inesperado. Intentá de nuevo.");
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" {...register("redirect")} />

            <div>
                <label className={labelClass} htmlFor="name">Nombre completo</label>
                <input id="name" type="text" autoComplete="name" className={inputClass} placeholder="Juan Pérez" {...register("name")} />
                {errors.name && <p className="text-xs text-caution mt-1.5">{errors.name.message}</p>}
            </div>

            <div>
                <label className={labelClass} htmlFor="email">Email</label>
                <input id="email" type="email" autoComplete="email" className={inputClass} placeholder="tu@email.com" {...register("email")} />
                {errors.email && <p className="text-xs text-caution mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
                <label className={labelClass} htmlFor="phone">
                    Teléfono{" "}
                    <span className="normal-case tracking-normal font-sans text-osd-dim">(opcional)</span>
                </label>
                <input id="phone" type="tel" autoComplete="tel" className={inputClass} placeholder="+54 261 000-0000" {...register("phone")} />
            </div>

            <div>
                <label className={labelClass} htmlFor="password">Contraseña</label>
                <input id="password" type="password" autoComplete="new-password" className={inputClass} placeholder="Mínimo 8 caracteres" {...register("password")} />
                {errors.password && <p className="text-xs text-caution mt-1.5">{errors.password.message}</p>}
            </div>

            <div>
                <label className={labelClass} htmlFor="confirmPassword">Confirmar contraseña</label>
                <input id="confirmPassword" type="password" autoComplete="new-password" className={inputClass} placeholder="Repetí tu contraseña" {...register("confirmPassword")} />
                {errors.confirmPassword && <p className="text-xs text-caution mt-1.5">{errors.confirmPassword.message}</p>}
            </div>

            {serverError && (
                <div className="border border-caution text-caution text-sm px-4 py-3" role="alert">
                    {serverError}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="vf-btn vf-btn-primary w-full mt-2"
            >
                {isSubmitting ? <><Loader2 size={15} className="animate-spin" />Creando cuenta...</> : "Crear cuenta"}
            </button>
        </form>
    );
}
