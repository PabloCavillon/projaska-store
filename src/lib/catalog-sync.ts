/** Forma de los productos en la API de sincronización (n8n). `active` = showInStore, `inStock` = isMadeToOrder. */
export const catalogSelect = {
    id: true, sku: true, model: true, name: true, description: true, price: true, brand: true, category: true,
    stockStatus: true, isMadeToOrder: true, showInStore: true, specs: true, imageUrl: true, sourceImageUrl: true, deletedAt: true,
} as const;

type Row = {
    id: string; sku: string; model: string | null; name: string; description: string | null;
    price: { toString(): string } | number; brand: string | null; category: string; stockStatus: string | null;
    isMadeToOrder: boolean; showInStore: boolean; specs: string[]; imageUrl: string | null;
    sourceImageUrl: string | null; deletedAt: Date | null;
};

export function toCatalogItem(r: Row) {
    return {
        id: r.id, sku: r.sku, model: r.model, name: r.name, description: r.description, price: Number(r.price),
        brand: r.brand, category: r.category, stockStatus: r.stockStatus,
        // Sin stock propio, el producto se vende "por encargo" solo si el proveedor lo tiene
        inStock: r.isMadeToOrder, active: r.showInStore,
        specs: r.specs, imageUrl: r.imageUrl, sourceImageUrl: r.sourceImageUrl, deleted: r.deletedAt !== null,
    };
}

export type CatalogItem = ReturnType<typeof toCatalogItem>;

/** Nombres de la API → columnas de Product. */
export function toColumns(data: Record<string, unknown>): Record<string, unknown> {
    const { active, inStock, ...rest } = data;
    return { ...rest, ...(active !== undefined && { showInStore: active }), ...(inStock !== undefined && { isMadeToOrder: inStock }) };
}

/** "DH-IPC 1230" y "dhipc1230" son el mismo modelo. */
export const modelKey = (m: string) => m.replace(/[\s-]/g, "").toLowerCase();
