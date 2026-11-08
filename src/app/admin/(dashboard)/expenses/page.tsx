import { getExpenses, getExpenseSummary, getRecurringExpenses } from "@/actions/expenses";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import { RecurringExpensesSection } from "@/components/expenses/recurring-expenses-section";
import { PageLayout } from "@/components/ui/layout-page";
import { auth } from "@/auth";
import { Receipt } from "lucide-react";

export const metadata = { title: "Gastos" };

function fmtArs(n: number) {
    return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}
function fmtUsd(n: number) {
    return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

export default async function ExpensesPage() {
    const [expenses, summary, recurring, session] = await Promise.all([
        getExpenses(),
        getExpenseSummary(),
        getRecurringExpenses(),
        auth(),
    ]);

    const isAdmin = session?.user?.role === "ADMIN";

    return (
        <PageLayout
            title="Gastos"
            subtitle={`${expenses.length} registros`}
            icon={Receipt}
            buttonText="Nuevo Gasto"
            buttonHref="/admin/expenses/new"
        >
            {/* Resumen */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 border-b border-zinc-100">
                <div className="bg-blue-50 rounded-2xl p-4">
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Compras (USD)</p>
                    <p className="text-xl font-black text-blue-900">{fmtUsd(summary.totalPurchaseUsd)}</p>
                    {summary.totalPurchaseArs > 0 && (
                        <p className="text-xs text-blue-400 mt-0.5">≈ {fmtArs(summary.totalPurchaseArs)}</p>
                    )}
                </div>
                <div className="bg-amber-50 rounded-2xl p-4">
                    <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Envíos (ARS)</p>
                    <p className="text-xl font-black text-amber-900">{fmtArs(summary.totalShippingArs)}</p>
                </div>
                <div className="bg-purple-50 rounded-2xl p-4">
                    <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-1">Publicidad (ARS)</p>
                    <p className="text-xl font-black text-purple-900">{fmtArs(summary.totalAdvertisingArs)}</p>
                </div>
                <div className="bg-zinc-50 rounded-2xl p-4">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Otros (ARS)</p>
                    <p className="text-xl font-black text-zinc-900">{fmtArs(summary.totalOtherArs)}</p>
                </div>
                <div className="bg-zinc-900 rounded-2xl p-4 col-span-2 md:col-span-1">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Total gastos (ARS)</p>
                    <p className="text-xl font-black text-white">{fmtArs(summary.grandTotalArs)}</p>
                    {summary.totalPurchaseArs === 0 && summary.totalPurchaseUsd > 0 && (
                        <p className="text-xs text-zinc-500 mt-0.5">Compras sin cotización registrada</p>
                    )}
                </div>
            </div>

            <RecurringExpensesSection items={recurring} isAdmin={isAdmin} />
            <ExpensesTable expenses={expenses} isAdmin={isAdmin} />
        </PageLayout>
    );
}
