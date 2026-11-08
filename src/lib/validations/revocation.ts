import z from "zod";

export const revocationSchema = z.object({
	orderCode: z.string().trim().min(1, "Ingresá el código del pedido").max(30),
	name: z.string().trim().min(2, "Ingresá tu nombre").max(100),
	email: z.string().trim().email("Email inválido").max(200),
	phone: z.string().trim().max(40).optional(),
	reason: z.string().trim().max(1000).optional(),
});

export type RevocationFormData = z.infer<typeof revocationSchema>;
