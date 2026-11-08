import { prisma } from "@/lib/prisma";

export type LoginScope = "store" | "admin";

export const MAX_FAILED_LOGINS = 5;
export const LOCKOUT_MINUTES = 15;

/** IP del cliente. En Vercel x-real-ip y x-forwarded-for los pone el proxy (el valor del cliente se descarta). */
export function clientIp(headers: Headers): string {
	return headers.get("x-real-ip") ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

const windowStart = () => new Date(Date.now() - LOCKOUT_MINUTES * 60_000);

/** true si la IP acumuló MAX_FAILED_LOGINS fallos en los últimos LOCKOUT_MINUTES (ventana deslizante). */
export async function isLoginBlocked(scope: LoginScope, ip: string): Promise<boolean> {
	const failures = await prisma.loginAttempt.count({ where: { ip, scope, createdAt: { gte: windowStart() } } });
	return failures >= MAX_FAILED_LOGINS;
}

export async function recordLoginFailure(scope: LoginScope, ip: string): Promise<void> {
	await prisma.loginAttempt.create({ data: { ip, scope } });
	// Limpieza oportunista para que la tabla no crezca: lo viejo ya no cuenta para ningún bloqueo
	if (Math.random() < 0.05) {
		await prisma.loginAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 3_600_000) } } });
	}
}

export async function clearLoginFailures(scope: LoginScope, ip: string): Promise<void> {
	await prisma.loginAttempt.deleteMany({ where: { ip, scope } });
}

export const LOCKOUT_MESSAGE = `Demasiados intentos fallidos. Probá de nuevo en ${LOCKOUT_MINUTES} minutos.`;
