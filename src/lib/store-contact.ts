export const WHATSAPP_NUMBER = "5493873443522";

export function whatsappUrl(message: string): string {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Identificación del vendedor exigida por la Ley 24.240 (art. 4) y la Ley 25.326. Completar antes de publicar.
export const LEGAL = {
    holder: "[RAZÓN SOCIAL O NOMBRE DEL TITULAR]",
    cuit: "[CUIT]",
    address: "[DOMICILIO COMERCIAL], Salta, Argentina",
    email: "info.projaska@gmail.com",
    updated: "8 de noviembre de 2026",
};

export const CONSUMER_CLAIMS_URL = "https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario";
