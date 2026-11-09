import z from "zod";

export const stockMovementSchema = z.object({
	productId: z.string().min(1, "El producto es requerido"),
	type: z.enum(["IN", "OUT"]),
	quantity: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1"),
	reason: z.string().trim().optional(),
});

export type StockMovementFormInput = z.input<typeof stockMovementSchema>;
export type StockMovementFormData = z.output<typeof stockMovementSchema>;
