import { z } from "zod";
import { STOCK_STATUSES } from "@/lib/stock-status";

const key = z.string().trim().min(1);

/** Body de POST /api/price-sync/update (contrato del workflow de n8n). */
export const priceSyncUpdateSchema = z.object({
    // Exactamente UNA clave para encontrar el producto
    match: z.union([
        z.strictObject({ id: key }),
        z.strictObject({ sku: key }),
        z.strictObject({ model: key }),
    ]),
    set: z.strictObject({
        // Precio en USD, como Product.price (Decimal 10,2)
        price: z.number().positive().max(99_999_999.99).optional(),
        sku: key.optional(),
        description: z.string().optional(),
    }).refine((s) => Object.keys(s).length > 0, { message: "set no trae ningún campo" }),
    source: key.max(100),
});

export type PriceSyncUpdate = z.infer<typeof priceSyncUpdateSchema>;

/** Campos del catálogo que manda n8n, con nombres de la API. Todos opcionales: solo se toca lo que viene. */
const upsertData = z.strictObject({
    model: key.max(100),
    sku: key.max(100),
    name: key.max(300),
    description: z.string().trim().max(10_000),
    brand: key.max(100),
    category: key.max(100),
    price: z.number().positive().max(99_999_999.99),
    stockStatus: z.enum(STOCK_STATUSES),
    inStock: z.boolean(),
    active: z.boolean(),
    specs: z.array(z.string().trim().min(1).max(200)).max(40),
    // null en un update borra la foto (p. ej. un placeholder "sin foto" guardado por error)
    imageUrl: z.url({ protocol: /^https?$/ }).nullable(),
    sourceId: key.max(100),
    sourceUrl: z.url({ protocol: /^https$/ }),
}).partial();

export const upsertItemSchema = z.discriminatedUnion("op", [
    z.strictObject({
        op: z.literal("create"),
        match: z.null().optional(),
        data: upsertData.required({ model: true, name: true, price: true }),
    }),
    z.strictObject({
        op: z.enum(["update", "deactivate"]),
        match: z.union([z.strictObject({ id: key }), z.strictObject({ sourceId: key })]),
        data: upsertData.default({}),
    }),
]);

/** Body de POST /api/price-sync/upsert. Los items se validan uno por uno: uno mal formado no frena el lote. */
export const upsertBodySchema = z.strictObject({
    source: key.max(100),
    items: z.array(z.unknown()).min(1).max(100),
});

export type UpsertItem = z.infer<typeof upsertItemSchema>;
export type UpsertData = z.infer<typeof upsertData>;
