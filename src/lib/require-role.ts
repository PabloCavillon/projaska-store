import { auth } from "@/auth";

export type Role = "ADMIN" | "SELLER" | "WAREHOUSE" | "WATCHER";

/**
 * Las server actions se pueden llamar desde cualquier página, así que el proxy no alcanza:
 * cada acción que modifica datos verifica sesión y rol acá. Mismos roles que el menú del panel.
 */
export async function requireRole(...roles: Role[]) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    if (!roles.includes(session.user.role as Role)) throw new Error("Forbidden");
    return session as typeof session & { user: { id: string; role: Role } };
}
