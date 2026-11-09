import { z } from "zod";

export const kitItemSchema = z.object({
    productId: z.string().optional(),
    childKitId: z.string().optional(),
    quantity: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1"),
}).refine((d) => d.productId || d.childKitId, {
    message: "Cada ítem debe ser un producto o un kit",
});

export const kitSchema = z.object({
    sku: z.string().trim().min(1, "El SKU es obligatorio"),
    name: z.string().trim().min(1, "El nombre es obligatorio"),
    description: z.string().trim().optional(),
    imageUrl: z.string().trim().optional(),
    price: z.coerce.number().positive("El precio debe ser mayor a 0"),
    isActive: z.boolean().default(true),
    items: z.array(kitItemSchema).min(1, "El kit debe tener al menos un ítem"),
});

export type KitFormInput = z.input<typeof kitSchema>;
export type KitFormData = z.output<typeof kitSchema>;
