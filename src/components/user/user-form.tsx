'use client';


import { preventEnterSubmit } from "@/lib/utils";
import { createUser, updateUser } from "@/actions/users";
import { Role } from "@/generated/prisma/enums";
import { CreateUserFormData, createUserSchema, UserFormData, UserFormInput, userSchema } from "@/lib/validations/user";
import { SerializedUser } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function UserForm({ user }: { user?: SerializedUser }) {

    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null)

    const isEditing = !!user

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<UserFormInput, unknown, UserFormData>({
        resolver: zodResolver(isEditing ? userSchema : createUserSchema),
        defaultValues: {
            username: user?.username ?? "",
            role: (user?.role as any) ?? "SELLER",
            password: "",
        },
    })

    const onSubmit = async (data: UserFormData) => {
        setServerError(null)
        try {
            if (isEditing) {
                await updateUser(user.id, data)
            } else {
                await createUser(data as CreateUserFormData)
            }
            router.push("/admin/users")
            router.refresh()
        } catch (e) {
            setServerError(e instanceof Error ? e.message : "Algo salió mal. Por favor intente de nuevo.")
        }
    }


    const labelClass = "text-xs font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2 ml-1 block";
    const inputClass = "w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-base text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all placeholder:text-zinc-400";
    const btnPrimary = "flex-1 md:flex-none inline-flex items-center justify-center px-10 py-3.5 rounded-xl text-base font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-all active:scale-[0.98] gap-2 shadow-sm disabled:opacity-50";
    const btnSecondary = "flex-1 md:flex-none inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-base font-bold text-zinc-500 hover:bg-zinc-100 transition-all gap-2";

    return (
        <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 max-w-sm">
            <div className="flex flex-col">
                <label className={labelClass}>Usuario</label>
                <input
                    {...register("username")}
                    placeholder="nombre_usuario"
                    className={inputClass}
                />
                {errors.username && <p className="text-sm text-red-500 mt-1 ml-1">{errors.username.message}</p>}
            </div>

            <div className="flex flex-col">
                <label className={labelClass}>Rol</label>
                <select {...register("role")} className={`${inputClass} bg-white`}>
                    <option value={Role.SELLER}>Vendedor</option>
                    <option value={Role.WAREHOUSE}>Depósito</option>
                    <option value={Role.ADMIN}>Admin</option>
                    <option value={Role.WATCHER}>Observador</option>
                </select>
                {errors.role && <p className="text-sm text-red-500 mt-1 ml-1">{errors.role.message}</p>}
            </div>

            <div className="flex flex-col">
                <label className={labelClass}>
                    Contraseña{" "}
                    {isEditing && <span className="text-zinc-400 font-normal normal-case">(dejá en blanco para mantener la actual)</span>}
                </label>
                <input
                    {...register("password")}
                    type="password"
                    className={inputClass}
                />
                {errors.password && <p className="text-sm text-red-500 mt-1 ml-1">{errors.password.message}</p>}
            </div>

            {serverError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                    {serverError}
                </div>
            )}

            <div className="flex flex-col-reverse md:flex-row gap-3 pt-6 border-t border-zinc-100">
                <button type="button" onClick={() => router.back()} className={btnSecondary}>
                    <X className="w-4 h-4" /> Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className={btnPrimary}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isEditing ? "Guardar Cambios" : "Crear Usuario"}
                </button>
            </div>
        </form>
    );
}