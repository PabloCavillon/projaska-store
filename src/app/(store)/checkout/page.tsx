import { redirect } from "next/navigation";
import { getStoreSession } from "@/lib/store-auth";
import { getPriceConfig } from "@/actions/config";
import { prisma } from "@/lib/prisma";
import { CheckoutClient } from "@/components/store/checkout-client";

export const metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
    const session = await getStoreSession();
    if (!session) redirect("/login?redirect=/checkout");

    const config = await getPriceConfig();
    if (!config) redirect("/");

    // Obtener si el cliente es del gremio (vía customer vinculado)
    const storeCustomer = await prisma.storeCustomer.findUnique({
        where: { id: session.id },
        include: { customer: { select: { isGuild: true } } },
    });
    const isGuild = storeCustomer?.customer?.isGuild ?? false;

    return (
        <div className="max-w-2xl mx-auto">
            <CheckoutClient
                config={{
                    dollarRate: config.dollarRate,
                    shippingPct: config.shippingPct,
                    profitPct: config.profitPct,
                    guildDiscountPct: config.guildDiscountPct,
                    volumeDiscountPct: config.volumeDiscountPct,
                    volumeThresholdArs: config.volumeThresholdArs,
                }}
                isGuild={isGuild}
                customerName={session.name}
            />
        </div>
    );
}
