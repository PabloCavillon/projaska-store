"use client"

import { OrderStatus } from "@/generated/prisma/enums";
import { STATUS_LABEL } from "@/types/order-status";
import { ChartBarIcon } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

type Props = {
    data: { status: OrderStatus; count: number }[]
}

const COLORS: Record<string, string> = {
    PENDING: "#f59e0b",
    CONFIRMED: "#3b82f6",
    SHIPPED: "#8b5cf6",
    DELIVERED: "#10b981",
    CANCELLED: "#ef4444",
}

export function OrdersByStatusChart({ data }: Props) {
    const formatted = data.map((d) => ({
        name: STATUS_LABEL[d.status] ?? d.status,
        value: d.count,
        color: COLORS[d.status] ?? "#6b7280",
    }))

    return (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-zinc-100 rounded-xl text-zinc-900 shrink-0">
                    <ChartBarIcon size={18} />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">Estado de Órdenes</h2>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Distribución de pedidos</p>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-sm text-zinc-400 italic font-light">
                    No hay datos disponibles aún
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                        <Pie data={formatted} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none" animationDuration={600}>
                            {formatted.map((entry, index) => (
                                <Cell key={index} fill={entry.color} className="outline-none" />
                            ))}
                        </Pie>
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ fontSize: '12px', fontWeight: 'bold', borderRadius: 0, border: "1px solid #d3d8db", boxShadow: "none", padding: '10px 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                        <Legend verticalAlign="bottom" align="center" iconType="circle" iconSize={8}
                            formatter={(value) => (
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}