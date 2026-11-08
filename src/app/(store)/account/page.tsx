import Link from "next/link";
import { redirect } from "next/navigation";
import { getStoreSession } from "@/lib/store-auth";
import DeleteAccountForm from "@/components/store/delete-account-form";

export const metadata = { title: "Mi cuenta", robots: { index: false } };

export default async function AccountPage() {
    const session = await getStoreSession();
    if (!session) redirect("/login?redirect=/account");

    return (
        <div className="max-w-3xl mx-auto space-y-10">
            <div className="border-b border-hud-line pb-4">
                <h1 className="osd text-4xl">Mi cuenta</h1>
            </div>

            <dl className="grid sm:grid-cols-[10rem_1fr] gap-x-6 gap-y-3">
                <dt className="osd text-sm text-osd-dim">Nombre</dt>
                <dd>{session.name}</dd>
                <dt className="osd text-sm text-osd-dim">Email</dt>
                <dd className="break-all">{session.email}</dd>
                <dt className="osd text-sm text-osd-dim">Pedidos</dt>
                <dd><Link href="/orders" className="text-pj-ink hover:underline underline-offset-4">Ver mis pedidos</Link></dd>
            </dl>

            <section aria-labelledby="baja" className="border border-hud-line px-5 py-6 sm:px-8 space-y-4">
                <h2 id="baja" className="osd text-lg">Darse de baja</h2>
                <p className="text-sm text-osd-dim">
                    Podés eliminar tu cuenta cuando quieras. Los pedidos ya hechos se conservan sin tus datos de contacto, como exigen
                    las normas impositivas. Si tenés un pedido en curso, esperá a que se entregue o se cancele.{" "}
                    <Link href="/privacy" className="text-pj-ink hover:underline underline-offset-4">Política de privacidad</Link>
                </p>
                <DeleteAccountForm />
            </section>
        </div>
    );
}
