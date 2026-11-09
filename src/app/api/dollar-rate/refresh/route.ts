import { NextResponse } from "next/server";
import { isPriceSyncAuthorized } from "@/lib/price-sync-auth";
import { refreshDollarRate } from "@/lib/dollar-rate";

/** n8n (Schedule cada 1 hora): actualiza el dólar oficial. Misma API key que price-sync. */
export async function POST(request: Request) {
    if (!isPriceSyncAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await refreshDollarRate();
        if (result.status === "rejected") {
            console.warn("[dollar-rate/refresh] rechazado", result);
            return NextResponse.json(result, { status: 409 });
        }
        return NextResponse.json(result);
    } catch (e) {
        console.error("[dollar-rate/refresh]", e);
        // Ruta protegida por API key: el detalle va a n8n para saber si falló dolarapi o la DB.
        const detail = e instanceof Error ? e.message.slice(0, 300) : String(e);
        return NextResponse.json({ error: "No se pudo actualizar la cotización", detail }, { status: 502 });
    }
}
