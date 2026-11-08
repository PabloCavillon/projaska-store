import { z } from "zod";

export const checkoutItemsSchema = z.array(
    z.object({
        productId: z.string().min(1).optional(),
        kitId: z.string().min(1).optional(),
        quantity: z.number().int().min(1).max(9999),
        unit: z.enum(["unit", "box"]).default("unit"),
    }).refine((i) => !!i.productId !== !!i.kitId, { message: "Cada línea es un producto o un kit" }),
).max(200);
