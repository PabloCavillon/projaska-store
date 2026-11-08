import { createHash, timingSafeEqual } from "node:crypto";

/** true si el request trae `Authorization: Bearer <PRICE_SYNC_API_KEY>`. Sin la variable configurada, rechaza todo. */
export function isPriceSyncAuthorized(request: Request): boolean {
    const expected = process.env.PRICE_SYNC_API_KEY;
    const header = request.headers.get("authorization") ?? "";
    if (!expected || !header.startsWith("Bearer ")) return false;
    // Se comparan hashes: timingSafeEqual exige el mismo largo y así no se filtra el largo del token
    const digest = (s: string) => createHash("sha256").update(s).digest();
    return timingSafeEqual(digest(header.slice(7)), digest(expected));
}
