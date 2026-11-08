"use client"

import { Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useDarkMode } from "@/hooks/use-dark-mode";

type Props = {
	data: { name: string; quantity: number }[]
}

export function TopProductsChart({ data }: Props) {
	const isDark = useDarkMode();

	const barColor    = isDark ? '#5fb2e8' : '#1479bc';
	const gridColor   = isDark ? '#2a2f33' : '#e6e9eb';
	const xLabelColor = isDark ? '#9aa2a8' : '#5d666c';
	const yLabelColor = isDark ? '#f2f4f5' : '#16191c';
	const cursorColor = isDark ? '#16191c' : '#f3f5f6';
	const tooltipBg   = isDark ? '#16191c' : '#ffffff';
	const tooltipBorder = isDark ? '#2a2f33' : '#d3d8db';
	const tooltipText = isDark ? '#f2f4f5' : '#16191c';

	return (
		<div className="bg-white rounded-3xl border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-6">
			<div className="flex items-center gap-3 mb-6">
				<div className="p-2 bg-zinc-100 rounded-xl text-zinc-900 shrink-0">
					<Star size={18} />
				</div>
				<div>
					<h2 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">Productos Top</h2>
					<p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Rendimiento por unidades</p>
				</div>
			</div>

			{data.length === 0 ? (
				<div className="h-48 flex items-center justify-center text-sm text-zinc-400 italic font-light">
					No hay datos de ventas disponibles
				</div>
			) : (
				<ResponsiveContainer width="100%" height={240}>
					<BarChart data={data} layout="vertical" margin={{ left: -20, right: 20 }} style={{ background: 'transparent' }}>
						<CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
						<XAxis type="number" tick={{ fontSize: 11, fill: xLabelColor, fontWeight: 600 }} axisLine={false} tickLine={false} />
						<YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: yLabelColor, fontWeight: 700 }} axisLine={false} tickLine={false} width={120} tickFormatter={(v) => v.length > 15 ? v.slice(0, 15) + "…" : v} />
						<Tooltip
							cursor={{ fill: cursorColor }}
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
						<Bar name="Cantidad" dataKey="quantity" fill={barColor} barSize={16} animationDuration={600} />
					</BarChart>
				</ResponsiveContainer>
			)}
		</div>
	);
}
