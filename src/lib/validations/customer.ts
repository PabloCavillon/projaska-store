import z from "zod";

export const customerSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	email: z.string().trim().pipe(z.union([z.literal(""), z.email("Invalid email")])).optional(),
	phone: z.string().trim().optional(),
	address: z.string().trim().optional(),
	notes: z.string().trim().optional(),
	isGuild: z.boolean().optional().default(false),
});

export type CustomerFormInput = z.input<typeof customerSchema>;
export type CustomerFormData = z.output<typeof customerSchema>;