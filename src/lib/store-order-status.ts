export const STATUS_LABEL: Record<string, string> = {
    PENDING: "Recibido · falta coordinar el pago",
    PAYMENT_REGISTERED: "Pago recibido",
    CONFIRMED: "Confirmado · en preparación",
    SHIPPED: "En camino",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
};

// Un pedido recién hecho no es una alarma: el ámbar queda para la acción que pide (el botón de WhatsApp).
export const STATUS_TONE: Record<string, string> = {
    CANCELLED: "text-osd-dim line-through",
};
