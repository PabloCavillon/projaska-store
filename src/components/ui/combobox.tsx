'use client';

import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useState } from "react";

interface ComboboxOption {
    value: string;
    label: string;
    sublabel?: string;
}

interface ComboboxProps {
    options: ComboboxOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
}

export default function Combobox({
    options,
    value,
    onChange,
    placeholder = 'Seleccionar...',
    searchPlaceholder = 'Buscar...',
    emptyMessage = 'No se encontraron resultados.'
}: ComboboxProps) {

    const [open, setOpen] = useState<boolean>(false);
    const [search, setSearch] = useState<string>('')

    const selected = options.find(o => o.value === value);

    const filtered = options.filter(o => {
        const q = search.toLowerCase();
        return (
            o.label.toLowerCase().includes(q) ||
            o.sublabel?.toLowerCase().includes(q)
        )
    })

    return (
        <div className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={cn(
                    "w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-base text-left transition-all outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900",
                    value ? "text-zinc-900" : "text-zinc-400"
                )}
            >
                <span className="flex items-center justify-between gap-2">
                    <span className="truncate">
                        {selected ? (
                            <span>
                                {selected.label}
                                {selected.sublabel && (
                                    <span className="ml-2 text-sm text-zinc-400">{selected.sublabel}</span>
                                )}
                            </span>
                        ) : (
                            placeholder
                        )}
                    </span>
                    <ChevronsUpDown size={16} className="text-zinc-400 shrink-0" />
                </span>
            </button>

            {/* Dropdown */}
            {open && (
                <>
                    {/* Overlay para cerrar al clickear afuera */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => { setOpen(false); setSearch(""); }}
                    />

                    <div className="absolute z-20 mt-2 w-full min-w-65 bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden">
                        {/* Search input */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100">
                            <Search size={14} className="text-zinc-400 shrink-0" />
                            <input
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="flex-1 text-sm text-zinc-900 placeholder:text-zinc-400 bg-transparent"
                            />
                        </div>

                        {/* Options */}
                        <div className="max-h-60 overflow-y-auto py-1">
                            {filtered.length === 0 ? (
                                <p className="px-4 py-6 text-sm text-zinc-400 text-center italic font-light">
                                    {emptyMessage}
                                </p>
                            ) : (
                                filtered.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(option.value);
                                            setOpen(false);
                                            setSearch("");
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-zinc-50 transition-colors",
                                            option.value === value && "bg-zinc-50"
                                        )}
                                    >
                                        <span className="flex flex-col">
                                            <span className="font-medium text-zinc-900">{option.label}</span>
                                            {option.sublabel && (
                                                <span className="text-xs text-zinc-400 font-mono">{option.sublabel}</span>
                                            )}
                                        </span>
                                        {option.value === value && (
                                            <Check size={14} className="text-zinc-900 shrink-0" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}