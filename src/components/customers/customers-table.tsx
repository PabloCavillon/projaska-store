'use client';

import { deleteCustomer } from "@/actions/customers";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchInput } from "../ui/search-input";
import { Edit2, Loader2, Trash2 } from "lucide-react";
import { SerializedCustomer } from "@/types/customer";

export default function CustomersTable({ customers: initialCustomers }: { customers: SerializedCustomer[] }) {

    const router = useRouter();
    const [customers, setCustomers] = useState<SerializedCustomer[]>(initialCustomers);
    const [search, setSearch] = useState("");
    const [deleting, setDeleting] = useState<string | null>(null);

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.toLowerCase().includes(search.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        if (!confirm("¿Desea eliminar el cliente?")) return;
        setDeleting(id);
        await deleteCustomer(id);
        setCustomers(prev => prev.filter(c => c.id !== id));
        setDeleting(null);
        router.refresh();
    }

    const thClasses = "px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] text-left";

    return (
        <div className="flex flex-col">
            <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Buscar por nombre, email o dirección..."
            />

            {filtered.length === 0 ? (
                <div className="py-20 text-center text-zinc-400 italic font-light">
                    No se encontraron clientes registrados.
                </div>
            ) : (
                <>
                    {/* ── DESKTOP: tabla ── */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-100">
                                    <th className={thClasses}>Nombre</th>
                                    <th className={thClasses}>Email</th>
                                    <th className={thClasses}>Teléfono</th>
                                    <th className={thClasses}>Dirección</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {filtered.map((customer) => (
                                    <tr key={customer.id} className="group hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-base text-zinc-900">{customer.name}</p>
                                            {customer.isGuild && (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full mt-1">
                                                    Gremio
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-500">
                                            {customer.email ?? "—"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-500 font-medium">
                                            {customer.phone ?? "—"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-400">
                                            {customer.address ?? "—"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <Link
                                                    href={`/admin/customers/${customer.id}/edit`}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-white border border-transparent hover:border-zinc-200 transition-all hover:shadow-sm"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(customer.id)}
                                                    disabled={deleting === customer.id}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                                                >
                                                    {deleting === customer.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── MOBILE: cards ── */}
                    <div className="flex flex-col divide-y divide-zinc-100 md:hidden">
                        {filtered.map((customer) => (
                            <div key={customer.id} className="flex items-start justify-between px-4 py-4 hover:bg-zinc-50/50 transition-colors">
                                <div className="flex flex-col gap-1 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-bold text-base text-zinc-900 leading-snug">
                                            {customer.name}
                                        </p>
                                        {customer.isGuild && (
                                            <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                                                Gremio
                                            </span>
                                        )}
                                    </div>
                                    {customer.email && (
                                        <p className="text-sm text-zinc-500 truncate">{customer.email}</p>
                                    )}
                                    {customer.phone && (
                                        <p className="text-sm text-zinc-500">{customer.phone}</p>
                                    )}
                                    {customer.address && (
                                        <p className="text-sm text-zinc-400 truncate">{customer.address}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-1 ml-3 shrink-0">
                                    <Link
                                        href={`/admin/customers/${customer.id}/edit`}
                                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-white border border-transparent hover:border-zinc-200 transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(customer.id)}
                                        disabled={deleting === customer.id}
                                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                                    >
                                        {deleting === customer.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}