"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validations/store-auth";
import { Loader2 } from "lucide-react";

const labelClass = "vf-label";
const inputClass = "vf-input";

interface StoreLoginFormProps {
    action: (data: LoginFormData) => Promise<{ error: string } | { redirectTo: string }>;
    redirectTo?: string;
}

export default function StoreLoginForm({ action, redirectTo }: StoreLoginFormProps) {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "", redirect: redirectTo },
    });

    const onSubmit = async (data: LoginFormData) => {
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
                <label className={labelClass} htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={inputClass}
                    placeholder="tu@email.com"
                    {...register("email")}
                />
                {errors.email && <p className="text-xs text-caution mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
                <label className={labelClass} htmlFor="password">Contraseña</label>
                <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    className={inputClass}
                    placeholder="••••••••"
                    {...register("password")}
                />
                {errors.password && <p className="text-xs text-caution mt-1.5">{errors.password.message}</p>}
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
                {isSubmitting ? <><Loader2 size={15} className="animate-spin" />Ingresando...</> : "Ingresar"}
            </button>
        </form>
    );
}
