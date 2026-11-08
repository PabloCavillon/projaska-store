import { z } from "zod";

// HTML number inputs emit "" when empty; z.coerce converts "" → 0 which fails
// .positive(). Pre-process empty strings to undefined so optional() can accept them.
const optionalPositiveNumber = z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.coerce.number().positive().optional(),
);

export const expenseSchema = z
    .object({
        type: z.enum(["PURCHASE", "SHIPPING", "OTHER", "ADVERTISING"]),
        description: z.string().min(1, "La descripción es requerida"),
        amountUsd: optionalPositiveNumber,
        amountArs: optionalPositiveNumber,
        dollarRate: optionalPositiveNumber,
        date: z.string().min(1, "La fecha es requerida"),
        notes: z.string().optional(),
    })
    .refine(
        (d) => {
            if (d.type === "PURCHASE") return d.amountUsd !== undefined && d.amountUsd > 0;
            return d.amountArs !== undefined && d.amountArs > 0;  // SHIPPING, OTHER, ADVERTISING
        },
        { message: "Ingresá el monto correspondiente al tipo de gasto" },
    )
    // Sin cotización la compra se sumaría como $ 0 en los gastos en pesos
    .refine((d) => d.type !== "PURCHASE" || (d.dollarRate !== undefined && d.dollarRate > 0), {
        message: "Ingresá la cotización del dólar de la compra",
        path: ["dollarRate"],
    });

export const recurringExpenseSchema = z.object({
    type: z.enum(["SHIPPING", "OTHER", "ADVERTISING"]),
    description: z.string().min(1),
    amountArs: z.number().positive(),
    notes: z.string().optional(),
});

export type ExpenseFormInput = z.input<typeof expenseSchema>;
export type ExpenseFormData = z.output<typeof expenseSchema>;
