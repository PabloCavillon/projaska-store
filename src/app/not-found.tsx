import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-4 text-center">
            <p className="text-8xl font-black text-zinc-100 leading-none select-none">404</p>
            <div className="-mt-6 space-y-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">
                    Página no encontrada
                </h1>
                <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                    La dirección que ingresaste no existe o fue movida.
                </p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                    href="/admin"
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 transition-colors"
                >
                    Ir al panel
                </Link>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-bold hover:bg-zinc-100 transition-colors"
                >
                    Ir a la tienda
                </Link>
            </div>
            <p className="mt-12 text-xs text-zinc-300 uppercase tracking-[0.3em]">
                Cuarzo Studio · Projaska
            </p>
        </div>
    );
}
