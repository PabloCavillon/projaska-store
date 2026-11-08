"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { deleteStoreAccount } from "@/actions/store/auth.actions";

export default function DeleteAccountForm() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [code, setCode] = useState<string | null>(null);

    if (code) {
        return (
            <div className="border border-hud-line px-4 py-4 space-y-3" role="status">
                <p>Tu cuenta fue dada de baja y borramos tus datos personales.</p>
                <p className="osd text-sm">Código de baja: <span className="text-osd">{code}</span></p>
                <p className="text-sm text-osd-dim">Guardalo como comprobante.</p>
                <button type="button" className="vf-btn vf-btn-ghost" onClick={() => router.push("/")}>Volver al inicio</button>
            </div>
        );
    }

    if (!open) {
        return (
            <button type="button" className="vf-btn vf-btn-ghost text-caution" onClick={() => setOpen(true)}>
                Darme de baja
            </button>
        );
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        try {
            const result = await deleteStoreAccount(password);
            if ("error" in result) setError(result.error);
            else {
                setCode(result.code);
                router.refresh();
            }
        } catch {
            setError("Ocurrió un error inesperado. Intentá de nuevo.");
        } finally {
            setPending(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <p className="text-sm">
                Esto no se puede deshacer. Se borran tu nombre, email, teléfono y dirección, y se cierra tu sesión. Ingresá tu
                contraseña para confirmar.
            </p>
            <div>
                <label className="vf-label" htmlFor="delete-password">Contraseña</label>
                <input
                    id="delete-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="vf-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            {error && <div className="border border-caution text-caution text-sm px-4 py-3" role="alert">{error}</div>}
            <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={pending || !password} className="vf-btn vf-btn-primary">
                    {pending ? <><Loader2 size={15} className="animate-spin" />Dando de baja...</> : "Confirmar baja"}
                </button>
                <button type="button" className="vf-btn vf-btn-ghost" onClick={() => { setOpen(false); setError(null); }}>
                    Cancelar
                </button>
            </div>
        </form>
    );
}
