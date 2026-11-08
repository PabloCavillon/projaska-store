export const STORE_COOKIE_NAME = "store-token";

/** Sin clave, TextEncoder firmaría con el texto "undefined" y cualquiera podría fabricar sesiones. */
export function storeJwtSecret(): Uint8Array {
    const secret = process.env.STORE_JWT_SECRET;
    if (!secret) throw new Error("Falta la variable de entorno STORE_JWT_SECRET");
    return new TextEncoder().encode(secret);
}
