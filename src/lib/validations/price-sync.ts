import { z } from "zod";

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
