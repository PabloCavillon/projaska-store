export const WHATSAPP_NUMBER = "5493873443522";

export function whatsappUrl(message: string): string {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
