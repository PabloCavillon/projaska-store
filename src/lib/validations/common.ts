/**
 * Las server actions reciben argumentos del cliente sin tipar. Si en lugar de un string llega un objeto
 * ({ not: "" }), Prisma lo interpreta como filtro y un updateMany/deleteMany toca filas ajenas.
 */
export function assertString(value: unknown, max = 100): string {
	if (typeof value !== "string" || value.length === 0 || value.length > max) throw new Error("Parámetro inválido");
	return value;
}
