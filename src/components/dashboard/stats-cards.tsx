'use client';

import { Package, Users as UsersIcon, ShoppingBag, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

type Stats = {
    totalProducts: number;
    totalCustomers: number;
    totalOrders: number;
    lowStockCount: number;
    totalRevenueArs: number;
    totalExpensesArs: number;
    totalAdvertisingArs: number;
};

const countCards = [
    { key: "totalProducts", label: "Productos", icon: Package },
    { key: "totalCustomers", label: "Clientes", icon: UsersIcon },
    { key: "totalOrders", label: "Órdenes", icon: ShoppingBag },
    { key: "lowStockCount", label: "Stock Bajo", icon: AlertTriangle, warning: true },
] as const;

// Regex-based formatter — output idéntico en Node.js y browser, evita hydration mismatch
function fmtArs(n: number) {
    const abs = Math.abs(n);
    const sign = n < 0 ? "-" : "";
    if (abs >= 1_000_000) {
        const val = Math.round(abs / 100_000) / 10;
        return `${sign}${val}M`;
    }
    if (abs >= 1_000) {
        return `${sign}${Math.round(abs / 1_000)}k`;
    }
    return `${sign}${Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export function StatsCards({ stats }: { stats: Stats }) {
    const netArs = stats.totalRevenueArs - stats.totalExpensesArs;
    const isProfit = netArs >= 0;

    const counts = countCards.map((card) => {
        const value = stats[card.key];
        return { ...card, value, caution: "warning" in card && card.warning && value > 0 };
    });

    const money = [
        { label: "Ingresos", value: stats.totalRevenueArs },
        { label: "Gastos", value: stats.totalExpensesArs },
        { label: "Publicidad", value: stats.totalAdvertisingArs },
    ];

    return (
        <div className="grid gap-px bg-zinc-200 border border-zinc-200 grid-cols-2 lg:grid-cols-4">
            {counts.map(({ key, label, icon: Icon, value, caution }) => (
                <div key={key} className="bg-white p-4 md:p-5 flex flex-col gap-3 min-w-0">
                    <span className={`uppercase text-[11px] flex items-center gap-2 ${caution ? "text-amber-600 dark:text-caution" : "text-zinc-500"}`}>
                        <Icon size={14} aria-hidden="true" /> {label}
                    </span>
                    <span className={`osd text-3xl md:text-4xl leading-none ${caution ? "text-amber-600 dark:text-caution" : "text-zinc-900"}`}>
                        {String(value).padStart(2, "0")}
                    </span>
                </div>
            ))}

            {money.map(({ label, value }) => (
                <div key={label} className="bg-white p-4 md:p-5 flex flex-col gap-3 min-w-0">
                    <span className="uppercase text-[11px] text-zinc-500">{label}</span>
                    <span className="osd text-2xl md:text-3xl leading-none text-zinc-900">$ {fmtArs(value)}</span>
                </div>
            ))}

            {/* Resultado: la única lectura con color, porque es la que decide */}
            <div className="bg-white p-4 md:p-5 flex flex-col gap-3 min-w-0">
                <span className="uppercase text-[11px] flex items-center gap-2 text-zinc-500">
                    {isProfit ? <TrendingUp size={14} aria-hidden="true" /> : <TrendingDown size={14} aria-hidden="true" />}
                    Resultado
                </span>
                <span className={`osd text-2xl md:text-3xl leading-none ${isProfit ? "text-emerald-700" : "text-red-600"}`}>
                    {isProfit ? "" : "−"}$ {fmtArs(Math.abs(netArs))}
                </span>
                <span className="text-[11px] text-zinc-500 -mt-1">{isProfit ? "Ganancia estimada" : "Pérdida estimada"}</span>
            </div>
        </div>
    );
}
