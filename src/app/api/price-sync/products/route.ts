import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPriceSyncAuthorized } from "@/lib/price-sync-auth";
import { catalogSelect, toCatalogItem } from "@/lib/catalog-sync";

/** Todos los productos no borrados (activos e inactivos) para que n8n los cruce con la lista del proveedor. `price` es costo USD. */
export async function GET(request: Request) {
    if (!isPriceSyncAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const products = await prisma.product.findMany({
            where: { deletedAt: null },
            select: catalogSelect,
            orderBy: { sku: "asc" },
        });
        return NextResponse.json(products.map((p) => {
            const { deleted: _d, ...item } = toCatalogItem(p);
            return item;
        }));
    } catch (e) {
        console.error("[price-sync/products]", e);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
