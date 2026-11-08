import StoreNavbar from "@/components/store/store-navbar";
import { CartProvider } from "@/contexts/cart-context";
import { ServiceWorkerRegistrar } from "@/components/store/service-worker-registrar";
import { getStoreSession } from "@/lib/store-auth";
import { CONSUMER_CLAIMS_URL, whatsappUrl } from "@/lib/store-contact";
import Link from "next/link";
import { Metadata } from "next";
import { osdFont } from "@/lib/fonts";
import { ArrowRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    openGraph: {
        type: "website",
        locale: "es_AR",
        siteName: "Projaska",
    },
    twitter: { card: "summary_large_image" },
};

export default async function StoreLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getStoreSession();

    return (
        <CartProvider>
            <ServiceWorkerRegistrar />
            <div className={`store ${osdFont.variable} min-h-screen flex flex-col`}>
                <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-lb focus:px-4 focus:py-3 osd text-sm">
                    Saltar al contenido
                </a>
                <StoreNavbar session={session} />
                <main id="contenido" tabIndex={-1} className="outline-none flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
                    {children}
                </main>
                <footer className="border-t border-hud-line">
                    <nav aria-label="Legales" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-8 flex flex-wrap gap-x-6 gap-y-3 osd text-xs text-osd-dim">
                        <Link href="/arrepentimiento" className="text-osd hover:text-pj-ink">Botón de arrepentimiento</Link>
                        <Link href="/terms" className="hover:text-osd">Términos y condiciones</Link>
                        <Link href="/privacy" className="hover:text-osd">Política de privacidad</Link>
                        <a href={CONSUMER_CLAIMS_URL} target="_blank" rel="noopener noreferrer" className="hover:text-osd">
                            Defensa de las y los consumidores. Para reclamos ingrese aquí
                        </a>
                    </nav>
                    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between osd text-xs text-osd-dim">
                        <span>
                            © {new Date().getFullYear()} Projaska · Tecnología y seguridad · Desarrollado por{" "}
                            <a href="https://cuarzostudio.com" target="_blank" rel="noopener" className="text-osd hover:text-pj-ink">Cuarzo Studio</a>
                        </span>
                        <a
                            href={whatsappUrl("Hola! Quería hacer una consulta.")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-osd inline-flex items-center gap-2"
                        >
                            Asesoramiento e instalación · WhatsApp <ArrowRight size={16} aria-hidden="true" />
                        </a>
                    </div>
                </footer>
            </div>
        </CartProvider>
    );
}
