import { z } from "zod"

export const userSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters"),
  role: z.enum(["ADMIN", "SELLER", "WAREHOUSE", "WATCHER"]),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
})

export const createUserSchema = userSchema.refine(
  (data) => !!data.password,
  { message: "Password is required", path: ["password"] }
)

export type UserFormInput = z.input<typeof userSchema>
export type UserFormData = z.output<typeof userSchema>
export type CreateUserFormData = UserFormData & { password: string }
export type UpdateUserFormData = UserFormData
