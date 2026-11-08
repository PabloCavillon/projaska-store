"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { createRevocationRequest } from "@/actions/store/revocation.actions";
import { revocationSchema, type RevocationFormData } from "@/lib/validations/revocation";

export default function RevocationForm({ defaults }: { defaults?: Partial<RevocationFormData> }) {
    const [serverError, setServerError] = useState<string | null>(null);
    const [code, setCode] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RevocationFormData>({
        resolver: zodResolver(revocationSchema),
        defaultValues: { orderCode: "", name: "", email: "", phone: "", reason: "", ...defaults },
    });

    const onSubmit = async (data: RevocationFormData) => {
        setServerError(null);
        try {
            const result = await createRevocationRequest(data);
            if ("error" in result) setServerError(result.error);
            else setCode(result.code);
        } catch {
            setServerError("Ocurrió un error inesperado. Intentá de nuevo.");
        }
    };

    if (code) {
        return (
            <div className="border border-hud-line px-5 py-6 space-y-3" role="status">
                <p className="text-lg">Recibimos tu solicitud.</p>
                <p className="osd">Código de arrepentimiento: <span className="text-pj-ink">{code}</span></p>
                <p className="text-sm text-osd-dim">
                    Guardá este código. Te vamos a contactar para coordinar la devolución del producto y el reintegro del dinero.
                </p>
            </div>
        );
    }

    return (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label className="vf-label" htmlFor="orderCode">Código de pedido</label>
                <input id="orderCode" className="vf-input" placeholder="STR-XXXXXXXX" {...register("orderCode")} />
                {errors.orderCode && <p className="text-xs text-caution mt-1.5">{errors.orderCode.message}</p>}
            </div>
            <div>
                <label className="vf-label" htmlFor="rev-name">Nombre completo</label>
                <input id="rev-name" autoComplete="name" className="vf-input" {...register("name")} />
                {errors.name && <p className="text-xs text-caution mt-1.5">{errors.name.message}</p>}
            </div>
            <div>
                <label className="vf-label" htmlFor="rev-email">Email</label>
                <input id="rev-email" type="email" autoComplete="email" className="vf-input" {...register("email")} />
                {errors.email && <p className="text-xs text-caution mt-1.5">{errors.email.message}</p>}
            </div>
            <div>
                <label className="vf-label" htmlFor="rev-phone">
                    Teléfono <span className="normal-case tracking-normal font-sans text-osd-dim">(opcional)</span>
                </label>
                <input id="rev-phone" type="tel" autoComplete="tel" className="vf-input" {...register("phone")} />
            </div>
            <div>
                <label className="vf-label" htmlFor="rev-reason">
                    Motivo <span className="normal-case tracking-normal font-sans text-osd-dim">(opcional, no es obligatorio dar motivos)</span>
                </label>
                <textarea id="rev-reason" rows={3} className="vf-input" {...register("reason")} />
            </div>
            {serverError && <div className="border border-caution text-caution text-sm px-4 py-3" role="alert">{serverError}</div>}
            <button type="submit" disabled={isSubmitting} className="vf-btn vf-btn-primary w-full sm:w-auto">
                {isSubmitting ? <><Loader2 size={15} className="animate-spin" />Enviando...</> : "Enviar solicitud"}
            </button>
        </form>
    );
}
