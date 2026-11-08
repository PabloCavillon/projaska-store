import z from "zod";

export const orderItemSchema = z.object({
	productId: z.string().min(1, "El producto es requerido"),
	quantity: z.coerce.number().int().min(1, "La cantidad mínima es 1"),
	unitPrice: z.coerce.number().positive(),
});

export const orderSchema = z.object({
	customerId: z.string().min(1, "El cliente es requerido"),
	notes: z.string().optional(),
	items: z
		.array(orderItemSchema)
		.min(1, "Al menos 1 producto es requerido.")
		.refine((items) => new Set(items.map((i) => i.productId)).size === items.length, {
			message: "Hay un producto repetido: sumá las cantidades en una sola línea.",
		}),
});

export type OrderFormInput = z.input<typeof orderSchema>;
export type OrderFormData = z.output<typeof orderSchema>;
