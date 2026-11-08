import z from "zod";

export const loginSchema = z.object({
	email: z.string().email("Email inválido"),
	password: z.string().min(1, "Ingresa tu contraseña"),
	redirect: z.string().optional(),
});

export const registerSchema = z
	.object({
		name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
		email: z.string().email("Email inválido"),
		phone: z.string().optional(),
		password: z
			.string()
			.min(8, "La contraseña debe tener al menos 8 caracteres"),
		confirmPassword: z.string(),
		redirect: z.string().optional(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Las contraseñas no coinciden",
		path: ["confirmPassword"],
	});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
