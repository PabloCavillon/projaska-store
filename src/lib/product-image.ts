import sharp from "sharp";

export { isLowRes } from "@/lib/product-image-size";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Baja una foto (10 s, máx 5 MB, solo image/*). Tira Error con el motivo. */
export async function downloadImage(url: string) {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = res.headers.get("content-type") ?? "";
    if (!type.startsWith("image/")) throw new Error(`no es una imagen (${type || "sin tipo"})`);
    if (Number(res.headers.get("content-length")) > MAX_IMAGE_BYTES) throw new Error("pesa más de 5 MB");
    // shortcut: sin content-length se baja entera antes de medirla (el timeout de 10 s la acota); leer por stream si el proveedor manda archivos enormes
    const body = await res.arrayBuffer();
    if (body.byteLength > MAX_IMAGE_BYTES) throw new Error("pesa más de 5 MB");
    return { body, type };
}

/** Ancho y alto reales en px. Tira si el archivo no es una imagen legible. */
export async function measureImage(body: ArrayBuffer) {
    const { width, height } = await sharp(Buffer.from(body)).metadata();
    if (!width || !height) throw new Error("no se pudo medir la foto");
    return { imageWidth: width, imageHeight: height };
}

/** Medidas de una foto ya publicada; null si no se puede bajar o leer. */
export async function measureImageUrl(url: string) {
    try {
        return await measureImage((await downloadImage(url)).body);
    } catch {
        return { imageWidth: null, imageHeight: null };
    }
}
