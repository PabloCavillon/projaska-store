import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isPriceSyncAuthorized } from "@/lib/price-sync-auth";
import { normalize } from "@/lib/search";
import { catalogSelect, modelKey, SUPPLIER, toCatalogItem, toColumns, type CatalogItem } from "@/lib/catalog-sync";
import { downloadImage, isLowRes, measureImage } from "@/lib/product-image";
import { upsertBodySchema, upsertItemSchema, type UpsertData, type UpsertItem } from "@/lib/validations/price-sync";

export const maxDuration = 60;

const IMAGE_BATCH = 8;

type Image = { url: string; source: string; imageWidth: number; imageHeight: number } | { error: string };
type Result = { index: number; id?: string; model?: string; status: string; changed?: string[]; error?: string; warning?: string };

/** Baja la foto del proveedor y la sube a Vercel Blob (el mismo storage que /api/upload). */
async function importImage(url: string): Promise<Image> {
    try {
        const { body, type } = await downloadImage(url);
        const size = await measureImage(body);
        const name = new URL(url).pathname.split("/").pop() || "foto";
        const blob = await put(`products/${name}`, body, { access: "public", addRandomSuffix: true, contentType: type });
        return { url: blob.url, source: url, ...size };
    } catch (e) {
        return { error: e instanceof Error ? e.message : String(e) };
    }
}

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const str = (v: unknown) => (v == null ? null : Array.isArray(v) ? JSON.stringify(v) : String(v));

/**
 * Alta, actualización y baja del catálogo desde la lista del proveedor (n8n), emparejando por model.
 * Cada item se procesa y registra por separado: un error en uno no frena el lote.
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
    const body = upsertBodySchema.safeParse(json);
    if (!body.success) {
        return NextResponse.json({ error: "Body inválido", issues: body.error.issues }, { status: 400 });
    }
    const { source, items } = body.data;

    let rows;
    try {
        // Incluye borrados: el índice único de sku también los cubre
        rows = await prisma.product.findMany({ select: catalogSelect });
    } catch (e) {
        console.error("[price-sync/upsert]", e);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }

    // Catálogo en memoria: cada item ve lo que cambiaron los anteriores del lote
    const byId = new Map<string, CatalogItem>();
    const byModel = new Map<string, CatalogItem>();
    // Incluye borrados: el índice único (supplier, sourceId) también los cubre
    const bySource = new Map<string, CatalogItem>();
    const skus = new Set<string>();
    const names = { brand: new Map<string, string>(), category: new Map<string, string>() };
    const track = (p: CatalogItem) => {
        byId.set(p.id, p);
        skus.add(p.sku);
        if (p.sourceId && p.supplier === SUPPLIER) bySource.set(p.sourceId, p);
        if (p.deleted) return;
        if (p.model && !byModel.has(modelKey(p.model))) byModel.set(modelKey(p.model), p);
        if (p.brand) names.brand.set(normalize(p.brand), p.brand);
        names.category.set(normalize(p.category), p.category);
    };
    rows.map(toCatalogItem).forEach(track);

    // Sin distinguir mayúsculas ni tildes: "camaras" usa la "Cámaras" que ya existe
    const canonical = (field: "brand" | "category", name: string) => {
        const known = names[field].get(normalize(name));
        if (known) return known;
        names[field].set(normalize(name), name);
        return name;
    };
    const targetOf = (it: UpsertItem) => {
        if (it.op === "create") return byModel.get(modelKey(it.data.model));
        const p = "id" in it.match ? byId.get(it.match.id) : bySource.get(it.match.sourceId);
        return p && !p.deleted ? p : undefined;
    };

    const parsed = items.map((i) => upsertItemSchema.safeParse(i));

    // Fotos primero y en paralelo (de a IMAGE_BATCH), para que 100 altas con foto entren en maxDuration
    const images = new Map<number, Image>();
    const toFetch = parsed.flatMap((p, index) => {
        if (!p.success || !p.data.data.imageUrl) return [];
        const url = p.data.data.imageUrl;
        return url !== targetOf(p.data)?.sourceImageUrl ? [{ index, url }] : [];
    });
    for (let i = 0; i < toFetch.length; i += IMAGE_BATCH) {
        await Promise.all(toFetch.slice(i, i + IMAGE_BATCH).map(async ({ index, url }) => images.set(index, await importImage(url))));
    }

    async function apply(item: UpsertItem, image: Image | undefined): Promise<Omit<Result, "index">> {
        const data: UpsertData = { ...item.data };
        if (item.op === "deactivate") Object.assign(data, { active: false, inStock: false });
        if (data.brand) data.brand = canonical("brand", data.brand);
        if (data.category) data.category = canonical("category", data.category);
        // Product.price es Decimal(10,2): redondear antes de comparar evita cambios fantasma
        if (data.price !== undefined) data.price = Math.round(data.price * 100) / 100;

        const warnings: string[] = [];
        // Columnas de la foto que no son de la API; imageUrl: null las limpia (sourceImageUrl queda: así no se vuelve a bajar el placeholder)
        let imageCols: { sourceImageUrl?: string; imageWidth: number | null; imageHeight: number | null } = { imageWidth: null, imageHeight: null };
        if (data.imageUrl) {
            if (!image) delete data.imageUrl; // la misma foto de origen que ya tenemos
            else if ("error" in image) {
                warnings.push(`no se pudo bajar la foto: ${image.error}`);
                delete data.imageUrl;
            } else {
                const { url, source, ...size } = image;
                data.imageUrl = url;
                imageCols = { sourceImageUrl: source, ...size };
                if (isLowRes(size.imageWidth, size.imageHeight)) warnings.push(`foto de baja resolución (${size.imageWidth}x${size.imageHeight})`);
            }
        }
        const warning = warnings.join("; ") || undefined;

        const target = targetOf(item);
        if (item.op !== "create" && !target) throw new Error(`No hay un producto con ${JSON.stringify(item.match)}`);
        if (data.model && target) {
            const other = byModel.get(modelKey(data.model));
            if (other && other.id !== target.id) throw new Error(`El modelo "${data.model}" ya lo usa otro producto (id ${other.id})`);
        }
        if (data.sourceId) {
            const other = bySource.get(data.sourceId);
            if (other && other.id !== target?.id) throw new Error(`El sourceId "${data.sourceId}" ya es del producto ${other.id}`);
        }

        if (!target && item.op === "create") {
            const { model, name } = item.data;
            const base = data.sku ?? model;
            let sku = base;
            for (let n = 2; skus.has(sku); n++) sku = `${base}-${n}`;
            const row = await prisma.$transaction(async (tx) => {
                const row = await tx.product.create({
                    data: {
                        sku, model, name, price: data.price!, description: data.description,
                        brand: data.brand, category: data.category ?? "Sin categoría", stockStatus: data.stockStatus,
                        specs: data.specs ?? [], isMadeToOrder: data.inStock ?? true, showInStore: data.active ?? true,
                        supplier: SUPPLIER, sourceId: data.sourceId, sourceUrl: data.sourceUrl,
                        imageUrl: data.imageUrl, ...(data.imageUrl && imageCols),
                    },
                    select: catalogSelect,
                });
                await tx.productSyncLog.create({ data: { productId: row.id, field: "created", newValue: model, op: "create", source } });
                return row;
            });
            track(toCatalogItem(row));
            return { id: row.id, model, status: "created", ...(warning && { warning }) };
        }
        const p = target!;

        if (data.sku && data.sku !== p.sku && skus.has(data.sku)) throw new Error(`El SKU "${data.sku}" ya lo usa otro producto`);
        const changed = (Object.keys(data) as (keyof UpsertData)[]).filter((k) => !same(p[k], data[k]));
        if (changed.length === 0) return { id: p.id, status: "unchanged", ...(warning && { warning }) };

        const set = Object.fromEntries(changed.map((k) => [k, data[k]]));
        await prisma.$transaction(async (tx) => {
            await tx.product.update({
                where: { id: p.id },
                data: { ...toColumns(set), ...(changed.includes("imageUrl") && imageCols) },
            });
            await tx.productSyncLog.createMany({
                data: changed.map((f) => ({ productId: p.id, field: f, oldValue: str(p[f]), newValue: str(data[f]), op: item.op, source })),
            });
        });
        if (set.sku) skus.delete(p.sku);
        if (set.model && p.model) byModel.delete(modelKey(p.model));
        if (set.sourceId && p.sourceId) bySource.delete(p.sourceId);
        track(Object.assign(p, set, changed.includes("imageUrl") ? imageCols : {}));
        return { id: p.id, status: item.op === "deactivate" ? "deactivated" : "updated", changed, ...(warning && { warning }) };
    }

    const results: Result[] = [];
    for (const [index, p] of parsed.entries()) {
        if (!p.success) {
            results.push({ index, status: "error", error: z.prettifyError(p.error) });
            continue;
        }
        try {
            results.push({ index, ...(await apply(p.data, images.get(index))) });
        } catch (e) {
            const code = (e as { code?: string })?.code;
            if (code) console.error("[price-sync/upsert]", index, e);
            const error = code === "P2002" ? "El SKU ya lo usa otro producto" : e instanceof Error ? e.message.slice(0, 300) : String(e);
            results.push({ index, status: "error", error });
        }
    }

    // Una sola vez por lote, y solo si algo cambió
    if (results.some((r) => r.status === "created" || r.status === "updated" || r.status === "deactivated")) {
        revalidatePath("/", "layout");
    }
    return NextResponse.json({ results });
}
