/** Lado mayor por debajo del cual la foto se pixela en la ficha. Sin sharp: lo usa también el admin en el cliente. */
export const LOW_RES_PX = 500;

/** Sin medidas cuenta como baja calidad: no sabemos si se pixela. */
export const isLowRes = (w: number | null, h: number | null) => w == null || h == null || Math.max(w, h) < LOW_RES_PX;
