"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { getExpenseSummary } from "@/actions/expenses";

export async function getDashboardData() {
	await requireRole("ADMIN", "SELLER", "WATCHER");
	const [
		totalProducts,
		totalCustomers,
		totalOrders,
		lowStockCount,
		lowStockProducts,
		recentOrders,
		topProducts,
		ordersByStatus,
		salesByMonth,
	] = await Promise.all([
		// Totales
		prisma.product.count({ where: { deletedAt: null } }),
		prisma.customer.count({ where: { deletedAt: null } }),
		prisma.order.count(),

		// Productos con stock bajo: el conteo va aparte porque la lista se corta en 5
		prisma.product.count({ where: { deletedAt: null, stock: { lte: 5 } } }),
		prisma.product.findMany({
			where: { deletedAt: null, stock: { lte: 5 } },
			orderBy: { stock: "asc" },
			take: 5,
			select: { id: true, name: true, sku: true, stock: true },
		}),

		// Últimos pedidos
		prisma.order.findMany({
			orderBy: { createdAt: "desc" },
			take: 5,
			include: {
				customer: { select: { name: true } },
			},
		}),

		// Productos más vendidos
		prisma.orderItem.groupBy({
			by: ["productId"],
			_sum: { quantity: true },
			orderBy: { _sum: { quantity: "desc" } },
			take: 6,
		}),

		// Pedidos por estado
		prisma.order.groupBy({
			by: ["status"],
			_count: { status: true },
		}),

		// Ventas por mes (últimos 6 meses)
		prisma.order.findMany({
			where: {
				createdAt: {
					gte: new Date(
						new Date().setMonth(new Date().getMonth() - 6),
					),
				},
				status: { not: "CANCELLED" },
			},
			select: { createdAt: true, total: true },
		}),
	]);

	// Resolución de nombres para top productos
	const topProductIds = topProducts.map((p) => p.productId);
	const productNames = await prisma.product.findMany({
		where: { id: { in: topProductIds } },
		select: { id: true, name: true },
	});
	const nameMap = Object.fromEntries(productNames.map((p) => [p.id, p.name]));

	// Agrupar ventas por mes
	const monthlyMap: Record<string, number> = {};
	for (const order of salesByMonth) {
		const month = new Date(order.createdAt).toLocaleString("en", {
			month: "short",
			year: "2-digit",
		});
		monthlyMap[month] = (monthlyMap[month] ?? 0) + Number(order.total);
	}

	// P&L: ingresos de pedidos confirmados/entregados (manuales + tienda) contra gastos
	const soldStatuses = ["CONFIRMED", "SHIPPED", "DELIVERED"] as const;
	const [manualRevenue, storeRevenue, expenses] = await Promise.all([
		prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: [...soldStatuses] } } }),
		// totalArs lo fija el admin al cobrar; si todavía no está, ese pedido no suma
		prisma.storeOrder.aggregate({ _sum: { totalArs: true }, where: { status: { in: [...soldStatuses] }, deletedAt: null } }),
		getExpenseSummary(),
	]);

	const totalRevenueArs = Number(manualRevenue._sum.total ?? 0) + Number(storeRevenue._sum.totalArs ?? 0);
	const totalExpensesArs = expenses.grandTotalArs;
	const totalAdvertisingArs = expenses.totalAdvertisingArs;

	return {
		stats: {
			totalProducts,
			totalCustomers,
			totalOrders,
			lowStockCount,
			totalRevenueArs: Math.round(totalRevenueArs),
			totalExpensesArs: Math.round(totalExpensesArs),
			totalAdvertisingArs: Math.round(totalAdvertisingArs),
		},
		lowStockProducts,
		recentOrders: recentOrders.map((o) => ({
			id: o.id,
			customerName: o.customer.name,
			status: o.status,
			total: Number(o.total),
			createdAt: o.createdAt.toISOString(),
		})),
		topProducts: topProducts.map((p) => ({
			name: nameMap[p.productId] ?? "Unknown",
			quantity: p._sum.quantity ?? 0,
		})),
		ordersByStatus: ordersByStatus.map((o) => ({
			status: o.status,
			count: o._count.status,
		})),
		salesByMonth: Object.entries(monthlyMap).map(([month, total]) => ({
			month,
			total: Math.round(total * 100) / 100,
		})),
	};
}
