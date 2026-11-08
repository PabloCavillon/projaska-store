import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPriceSyncAuthorized } from "@/lib/price-sync-auth";

/** Lista de productos no borrados para que n8n la cruce con la lista del proveedor. `price` es USD. */
export async function GET(request: Request) {
    if (!isPriceSyncAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const products = await prisma.product.findMany({
            where: { deletedAt: null },
            select: { id: true, sku: true, model: true, name: true, description: true, price: true },
            orderBy: { sku: "asc" },
        });
        return NextResponse.json(products.map((p) => ({ ...p, price: Number(p.price) })));
    } catch (e) {
        console.error("[price-sync/products]", e);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
