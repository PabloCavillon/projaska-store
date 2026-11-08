import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPriceSyncAuthorized } from "@/lib/price-sync-auth";
import { priceSyncUpdateSchema } from "@/lib/validations/price-sync";

type Field = "price" | "sku" | "description";
type Result = { status: number; body: unknown };

/**
 * Actualiza precio (USD), SKU y/o descripción de UN producto encontrado por id, sku o model.
 * Solo escribe los campos que cambian, y registra cada uno en ProductSyncLog en la misma transacción.
 */
export async function POST(request: Request) {
    if (!isPriceSyncAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let json: unknown;
    try {
        json = await request.json();
    } catch {
        return NextResponse.json({ error: "El body no es JSON válido" }, { status: 400 });
    }
    const parsed = priceSyncUpdateSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json({ error: "Body inválido", issues: parsed.error.issues }, { status: 400 });
    }
    const { match, set, source } = parsed.data;

    try {
        const result = await prisma.$transaction(async (tx): Promise<Result> => {
            const found = await tx.product.findMany({
                where: { deletedAt: null, ...match },
                select: { id: true, sku: true, price: true, description: true },
                take: 2,
            });
            if (found.length === 0) return { status: 404, body: { error: "No se encontró ningún producto", match } };
            if (found.length > 1) return { status: 409, body: { error: "Hay más de un producto con ese criterio; no se actualizó nada", match } };
            const product = found[0];

            const old = { price: Number(product.price), sku: product.sku, description: product.description };
            // Product.price es Decimal(10,2): comparar ya redondeado evita "cambios" fantasma por decimales
            const next = { ...set, ...(set.price !== undefined && { price: Math.round(set.price * 100) / 100 }) };

            const changed: Partial<Record<Field, [unknown, unknown]>> = {};
            for (const field of ["price", "sku", "description"] as const) {
                if (next[field] !== undefined && next[field] !== old[field]) changed[field] = [old[field], next[field]];
            }

            if (changed.sku) {
                // El índice único cubre también productos borrados, así que se busca en todos
                const taken = await tx.product.findFirst({
                    where: { sku: next.sku, id: { not: product.id } },
                    select: { id: true, name: true },
                });
                if (taken) {
                    return { status: 409, body: { error: `El SKU "${next.sku}" ya lo usa otro producto (${taken.name}, id ${taken.id}); no se actualizó nada` } };
                }
            }

            const fields = Object.keys(changed) as Field[];
            if (fields.length > 0) {
                await tx.product.update({
                    where: { id: product.id },
                    data: Object.fromEntries(fields.map((f) => [f, next[f]])),
                });
                await tx.productSyncLog.createMany({
                    data: fields.map((f) => ({
                        productId: product.id,
                        field: f,
                        oldValue: old[f] === null ? null : String(old[f]),
                        newValue: String(next[f]),
                        source,
                    })),
                });
            }

            return { status: 200, body: { id: product.id, changed } };
        });
        return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
        // Otro proceso tomó el mismo SKU entre la verificación y el UPDATE
        if ((e as { code?: string })?.code === "P2002") {
            return NextResponse.json({ error: `El SKU "${set.sku}" ya lo usa otro producto; no se actualizó nada` }, { status: 409 });
        }
        console.error("[price-sync/update]", e);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
