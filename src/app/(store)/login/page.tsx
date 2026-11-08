import { redirect } from "next/navigation";
import Link from "next/link";
import { getStoreSession } from "@/lib/store-auth";
import { loginStoreCustomer } from "@/actions/store/auth.actions";
import StoreLoginForm from "@/components/store/store-login-form";
import { safeRedirect } from "@/lib/utils";

export const metadata = { title: "Ingresar", robots: { index: false } };

interface LoginPageProps {
    searchParams: Promise<{ redirect?: string }>;
}

export default async function StoreLoginPage({ searchParams }: LoginPageProps) {
    const session = await getStoreSession();
    const params = await searchParams;

    if (session) redirect(safeRedirect(params.redirect));

    return (
        <div className="flex items-center justify-center py-6 sm:py-12">
            <div className="w-full max-w-md">
                <div className="border border-hud-line px-6 py-8 sm:px-10 sm:py-10">
                    <div className="mb-8">
                        <h1 className="osd text-4xl">Ingresar</h1>
                        <p className="text-sm text-osd-dim mt-2">{safeRedirect(params.redirect) === "/checkout" ? "Ingresá para enviar tu pedido. Tu carrito se mantiene." : "Accedé a tu cuenta para hacer y seguir pedidos."}</p>
                    </div>

                    <StoreLoginForm action={loginStoreCustomer} redirectTo={safeRedirect(params.redirect)} />
                </div>

                <p className="mt-6 text-center text-sm text-osd-dim">
                    ¿No tenés cuenta?{" "}
                    <Link href={params.redirect ? `/register?redirect=${encodeURIComponent(safeRedirect(params.redirect))}` : "/register"} className="text-pj-ink hover:underline underline-offset-4">
                        Registrate gratis
                    </Link>
                </p>
            </div>
        </div>
    );
}