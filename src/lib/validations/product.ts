import { z } from "zod";

export const productSchema = z.object({
	sku: z.string().trim().min(1, "SKU is required"),
	// Modelo del fabricante: clave de cruce con el proveedor (n8n). Vacío → null.
	model: z.preprocess(
		(v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null),
		z.string().trim().max(100).nullable()
	),
	brand: z.preprocess(
		(v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null),
		z.string().trim().max(100).nullable()
	),
	name: z.string().trim().min(1, "Name is required"),
	description: z.string().trim().optional(),
	imageUrl: z.string().trim().optional(),
	price: z.coerce.number().positive("Price must be greater than 0"),
	stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
	category: z.string().trim().min(1, "Category is required"),
	unitsPerBox: z.preprocess(
		(v) => (v === "" || v === null || v === undefined ? null : Number(v)),
		z.number().int().positive().nullable()
	),
	offerDiscountPct: z.preprocess(
		(v) => (v === "" || v === null || v === undefined ? null : Number(v)),
		z.number().min(1).max(99).nullable()
	),
	offerUnit: z.preprocess(
		(v) => (v === "" || v === null || v === undefined ? null : v),
		z.enum(["unit", "box"]).nullable()
	),
	isMadeToOrder: z.boolean().default(false),
	showInStore: z.boolean().default(true),
});

export type ProductFormInput = z.input<typeof productSchema>
export type ProductFormData = z.output<typeof productSchema>