import Link from "next/link";
import { Undo2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { PageLayout } from "@/components/ui/layout-page";

export const metadata = { title: "Arrepentimientos" };

const th = "px-6 py-4 text-xs text-zinc-500 uppercase tracking-[0.2em] text-left";
const td = "px-6 py-4 text-sm align-top";

export default async function RevocationsPage() {
    await requireRole("ADMIN", "SELLER");
    // shortcut: sin paginación ni estado "atendida"; agregar cuando haya volumen
    const requests = await prisma.revocationRequest.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    const orders = await prisma.storeOrder.findMany({
        where: { code: { in: requests.map((r) => r.orderCode) } },
        select: { id: true, code: true },
    });
    const orderId = new Map(orders.map((o) => [o.code, o.id]));

    return (
        <PageLayout title="Arrepentimientos" subtitle={`${requests.length} solicitudes · Botón de arrepentimiento`} icon={Undo2}>
            {requests.length === 0 ? (
                <div className="py-20 text-center text-zinc-400">Todavía no hay solicitudes.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-200">
                                <th className={th}>Fecha</th>
                                <th className={th}>Código</th>
                                <th className={th}>Pedido</th>
                                <th className={th}>Cliente</th>
                                <th className={th}>Motivo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {requests.map((r) => (
                                <tr key={r.id}>
                                    <td className={`${td} whitespace-nowrap`}>{r.createdAt.toLocaleString("es-AR", { timeZone: "America/Argentina/Salta" })}</td>
                                    <td className={`${td} font-mono`}>{r.code}</td>
                                    <td className={`${td} font-mono`}>
                                        {orderId.has(r.orderCode)
                                            ? <Link href={`/admin/store-orders/${orderId.get(r.orderCode)}`} className="underline underline-offset-4">{r.orderCode}</Link>
                                            : r.orderCode}
                                    </td>
                                    <td className={td}>
                                        <div>{r.name}</div>
                                        <div className="text-zinc-500 break-all">{r.email}{r.phone && ` · ${r.phone}`}</div>
                                    </td>
                                    <td className={`${td} text-zinc-600 max-w-sm`}>{r.reason ?? "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </PageLayout>
    );
}
