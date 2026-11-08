'use client'
import { TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useDarkMode } from "@/hooks/use-dark-mode";

type Props = {
    data: { month: string; total: number }[]
}

export function SalesByMonthChart({ data }: Props) {
    const isDark = useDarkMode();

    const gridColor   = isDark ? '#2a2f33' : '#e6e9eb';
    const labelColor  = isDark ? '#9aa2a8' : '#5d666c';
    const lineColor   = isDark ? '#5fb2e8' : '#1479bc'; // azul Projaska (ink sobre negro)
    const tooltipBg   = isDark ? '#16191c' : '#ffffff';
    const tooltipBorder = isDark ? '#2a2f33' : '#d3d8db';
    const tooltipText = isDark ? '#f2f4f5' : '#16191c';
    const gradientId  = isDark ? 'salesGradientDark' : 'salesGradientLight';

    return (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-zinc-100 rounded-xl text-zinc-900 shrink-0">
                    <TrendingUp size={18} />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">
                        Rendimiento de Ventas
                    </h2>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        Ingresos mensuales
                    </p>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-sm text-zinc-400 italic font-light">
                    No hay datos históricos para mostrar
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor={lineColor} stopOpacity={isDark ? 0.15 : 0.08} />
                                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11, fill: labelColor, fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: labelColor, fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v: number) => v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${Math.round(v / 1e3)}k` : `$${v}`}
                        />
                        <Tooltip
                            cursor={{ stroke: gridColor, strokeWidth: 1 }}
                            contentStyle={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                                borderRadius: 0,
                                border: `1px solid ${tooltipBorder}`,
                                boxShadow: 'none',
                                padding: '10px 12px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: tooltipText,
                                background: tooltipBg,
                            }}
                        />
                        <Area
                            type="linear"
                            dataKey="total"
                            stroke={lineColor}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#${gradientId})`}
                            animationDuration={600}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
