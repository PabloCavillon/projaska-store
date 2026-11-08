import { getPriceConfig } from "@/actions/config";
import { getStoreSession } from "@/lib/store-auth";
import { prisma } from "@/lib/prisma";
import { CartClient } from "@/components/store/cart-client";

export default async function CartPage() {
    const [session, config] = await Promise.all([getStoreSession(), getPriceConfig()]);

    const isGuild = session
        ? (await prisma.storeCustomer.findUnique({
            where: { id: session.id },
            select: { customer: { select: { isGuild: true } } },
        }))?.customer?.isGuild ?? false
        : false;

    return (
        <CartClient
            loggedIn={!!session}
            isGuild={isGuild}
            config={config && {
                dollarRate: config.dollarRate,
                shippingPct: config.shippingPct,
                profitPct: config.profitPct,
                guildDiscountPct: config.guildDiscountPct,
                volumeDiscountPct: config.volumeDiscountPct,
                volumeThresholdArs: config.volumeThresholdArs,
            }}
        />
    );
}
