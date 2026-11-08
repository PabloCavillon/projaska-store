/** Minúsculas y sin tildes: "cámara" encuentra "camara" y viceversa. */
export function normalize(s: string): string {
    return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

/** Cada palabra de la búsqueda tiene que aparecer en el nombre, SKU o categoría. */
export function matches(query: string, ...fields: (string | null | undefined)[]): boolean {
    const haystack = normalize(fields.filter(Boolean).join(" "));
    return normalize(query).split(/\s+/).every((w) => haystack.includes(w));
}
