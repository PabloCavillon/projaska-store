/** Texto que ve el cliente según el depósito del proveedor. Cambiar acá cambia toda la tienda. */
export const STOCK_STATUS_LABEL = {
    inmediato: "Entrega inmediata",
    deposito_2: "Entrega en 24/48 h",
    tercer_deposito: "Consultar disponibilidad",
} as const;

export type StockStatus = keyof typeof STOCK_STATUS_LABEL;
export const STOCK_STATUSES = Object.keys(STOCK_STATUS_LABEL) as [StockStatus, ...StockStatus[]];

export function stockStatusLabel(status: string | null | undefined): string | null {
    return status && status in STOCK_STATUS_LABEL ? STOCK_STATUS_LABEL[status as StockStatus] : null;
}
