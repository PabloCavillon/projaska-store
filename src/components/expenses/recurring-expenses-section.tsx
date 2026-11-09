'use client';

import { useState, useTransition } from "react";
import { SerializedRecurringExpense } from "@/types/expense";
import { createRecurringExpense, deleteRecurringExpense, registerRecurringExpense } from "@/actions/expenses";
import { cn, preventEnterSubmit } from "@/lib/utils";
import { Loader2, Plus, RefreshCw, Trash2, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const TYPE_OPTIONS = [
    { value: "SHIPPING" as const, label: "Envío", color: "bg-amber-50 text-amber-700 border-amber-100" },
    { value: "ADVERTISING" as const, label: "Publicidad", color: "bg-purple-50 text-purple-700 border-purple-100" },
    { value: "OTHER" as const, label: "Otro", color: "bg-zinc-50 text-zinc-600 border-zinc-200" },
];

function fmtArs(n: number) {
    return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export function RecurringExpensesSection({
    items: initial,
    isAdmin,
}: {
    items: SerializedRecurringExpense[];
    isAdmin: boolean;
}) {
    const router = useRouter();
    const [items, setItems] = useState(initial);
    const [showForm, setShowForm] = useState(false);
    const [registering, setRegistering] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const [form, setForm] = useState({
        type: "ADVERTISING" as "SHIPPING" | "OTHER" | "ADVERTISING",
        description: "",
        amountArs: "",
        notes: "",
    });

    const handleRegister = async (id: string) => {
        setRegistering(id);
        await registerRecurringExpense(id);
        setRegistering(null);
        router.refresh();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este gasto recurrente?")) return;
        setDeleting(id);
        await deleteRecurringExpense(id);
        setItems((prev) => prev.filter((i) => i.id !== id));
        setDeleting(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(form.amountArs);
        if (!form.description || isNaN(amount) || amount <= 0) return;

        startTransition(async () => {
            await createRecurringExpense({
                type: form.type,
                description: form.description,
                amountArs: amount,
                notes: form.notes || undefined,
            });
            setForm({ type: "ADVERTISING", description: "", amountArs: "", notes: "" });
            setShowForm(false);
            router.refresh();
        });
    };

    const inputCls = "w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 placeholder:text-zinc-400";

    return (
        <div className="border-b border-zinc-100 px-6 py-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <RefreshCw size={14} className="text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Gastos Recurrentes</span>
                    {items.length > 0 && (
                        <span className="text-xs bg-zinc-100 text-zinc-500 font-bold px-2 py-0.5 rounded-full">{items.length}</span>
                    )}
                </div>
                <button
                    onClick={() => setShowForm((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                    {showForm ? <X size={13} /> : <Plus size={13} />}
                    {showForm ? "Cancelar" : "Agregar"}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit} className="mb-4 bg-zinc-50 rounded-2xl p-4 space-y-3 border border-zinc-100">
                    <div className="flex gap-2 flex-wrap">
                        {TYPE_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
                                className={cn(
                                    "px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all",
                                    form.type === opt.value
                                        ? "border-zinc-900 bg-zinc-900 text-white"
                                        : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            placeholder="Descripción (ej: Publicidad MercadoLibre)"
                            className={inputCls}
                            required
                        />
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">$</span>
                            <input
                                value={form.amountArs}
                                onChange={(e) => setForm((f) => ({ ...f, amountArs: e.target.value }))}
                                type="number"
                                step="0.01"
                                placeholder="Monto ARS"
                                className={cn(inputCls, "pl-7")}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-100 rounded-xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-60 transition-all"
                        >
                            {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            Guardar
                        </button>
                    </div>
                </form>
            )}

            {/* List */}
            {items.length === 0 && !showForm ? (
                <p className="text-xs text-zinc-400 italic">No hay gastos recurrentes configurados.</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {items.map((item) => {
                        const typeOpt = TYPE_OPTIONS.find((t) => t.value === item.type);
                        return (
                            <div key={item.id} className="flex items-center justify-between gap-3 bg-white border border-zinc-100 rounded-2xl px-4 py-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={cn("shrink-0 inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest border", typeOpt?.color)}>
                                        {typeOpt?.label}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-zinc-900 truncate">{item.description}</p>
                                        {item.notes && <p className="text-xs text-zinc-400 truncate">{item.notes}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="font-bold text-sm text-zinc-700">{fmtArs(item.amountArs)}</span>
                                    <button
                                        onClick={() => handleRegister(item.id)}
                                        disabled={registering === item.id}
                                        title="Registrar gasto hoy"
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-60 transition-all"
                                    >
                                        {registering === item.id ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                                        Registrar
                                    </button>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            disabled={deleting === item.id}
                                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                                        >
                                            {deleting === item.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
