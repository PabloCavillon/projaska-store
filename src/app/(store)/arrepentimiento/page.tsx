import Link from "next/link";
import { getStoreSession } from "@/lib/store-auth";
import RevocationForm from "@/components/store/revocation-form";
import { LEGAL } from "@/lib/store-contact";

export const metadata = { title: "Botón de arrepentimiento" };

export default async function RevocationPage({ searchParams }: { searchParams: Promise<{ pedido?: string }> }) {
    const session = await getStoreSession();
    const { pedido } = await searchParams;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="border-b border-hud-line pb-4">
                <h1 className="osd text-4xl">Botón de arrepentimiento</h1>
            </div>
            <div className="space-y-3 text-sm sm:text-base leading-relaxed">
                <p>
                    Tenés 10 días corridos desde que recibiste el producto para cancelar la compra, sin dar motivos y sin costo
                    (art. 34 de la Ley 24.240 y Resolución 424/2020). No necesitás tener cuenta.
                </p>
                <p className="text-osd-dim">
                    Completá el formulario y te damos un código de arrepentimiento al instante. El producto tiene que volver en el
                    mismo estado en que lo recibiste; el envío de la devolución corre por nuestra cuenta. Más detalles en los{" "}
                    <Link href="/terms" className="text-pj-ink hover:underline underline-offset-4">Términos y condiciones</Link>.
                    Consultas: {LEGAL.email}.
                </p>
            </div>
            <div className="border border-hud-line px-5 py-6 sm:px-8">
                <RevocationForm defaults={{ orderCode: pedido ?? "", name: session?.name ?? "", email: session?.email ?? "" }} />
            </div>
        </div>
    );
}
