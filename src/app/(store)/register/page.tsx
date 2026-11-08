import { redirect } from "next/navigation";
import Link from "next/link";
import { getStoreSession } from "@/lib/store-auth";
import { registerStoreCustomer } from "@/actions/store/auth.actions";
import StoreRegisterForm from "@/components/store/store-register-form";
import { safeRedirect } from "@/lib/utils";

export const metadata = { title: "Crear cuenta", robots: { index: false } };

interface RegisterPageProps {
    searchParams: Promise<{ redirect?: string }>;
}

export default async function StoreRegisterPage({ searchParams }: RegisterPageProps) {
    const session = await getStoreSession();
    const params = await searchParams;
    const redirectTo = safeRedirect(params.redirect);

    if (session) redirect(redirectTo);

    const fromCheckout = redirectTo === "/checkout";

    return (
        <div className="flex items-center justify-center py-6 sm:py-12">
            <div className="w-full max-w-md">
                <div className="border border-hud-line px-6 py-8 sm:px-10 sm:py-10">
                    <div className="mb-8">
                        <h1 className="osd text-4xl">Crear cuenta</h1>
                        <p className="text-sm text-osd-dim mt-2">
                            {fromCheckout
                                ? "Con tu cuenta enviamos el pedido y podés seguir su estado. Tu carrito se mantiene."
                                : "Registrate para hacer pedidos y seguir su estado."}
                        </p>
                    </div>

                    <StoreRegisterForm action={registerStoreCustomer} redirectTo={redirectTo} />
                </div>

                <p className="mt-6 text-center text-sm text-osd-dim">
                    ¿Ya tenés cuenta?{" "}
                    <Link
                        href={params.redirect ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
                        className="text-pj-ink hover:underline underline-offset-4"
                    >
                        Ingresá acá
                    </Link>
                </p>
            </div>
        </div>
    );
}
