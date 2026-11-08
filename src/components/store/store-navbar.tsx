'use client';

import { useCart } from "@/contexts/cart-context";
import { StoreSession } from "@/lib/store-auth";
import { cn } from "@/lib/utils";
import { Menu, X, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "./logout-button";
import { ZoomBar, zoomOf } from "./vf-parts";

interface StoreNavbarProps {
    session: StoreSession | null;
}

function NavLink({ href, active, children, onClick }: { href: string; active: boolean; children: React.ReactNode; onClick?: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            aria-current={active ? "page" : undefined}
            className={cn(
                "vf-frame vf-focus osd text-sm px-3 py-2",
                active ? "is-locked text-osd" : "text-osd hover:text-osd",
            )}
        >
            {children}
        </Link>
    );
}

export default function StoreNavbar({ session }: StoreNavbarProps) {
    const { itemCount } = useCart();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const close = () => setMenuOpen(false);
    const count = String(itemCount).padStart(2, "0");

    return (
        <header className="sticky top-0 z-50 bg-lb border-b border-hud-line">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-6">
                <Link href="/" onClick={close} className="flex items-center gap-3 shrink-0" aria-label="Projaska, inicio">
                    <Image src="/icon-192.png" alt="" width={26} height={26} priority />
                    <span className="osd text-lg tracking-[0.14em]">Projaska</span>
                </Link>

                <nav className="hidden md:flex items-center gap-2" aria-label="Principal">
                    <NavLink href="/catalog" active={pathname.startsWith("/catalog")}>Catálogo</NavLink>
                    <NavLink href="/arrepentimiento" active={pathname === "/arrepentimiento"}>Arrepentimiento</NavLink>
                    {session && <NavLink href="/orders" active={pathname.startsWith("/orders")}>Mis pedidos</NavLink>}
                </nav>

                <div className={pathname === "/" ? "hidden" : "hidden lg:block"}>
                    <ZoomBar level={zoomOf(pathname)} />
                </div>

                <div className="hidden md:flex items-center gap-2">
                    {session ? (
                        <>
                            <NavLink href="/account" active={pathname === "/account"}>{session.name.split(" ")[0]}</NavLink>
                            <LogoutButton />
                        </>
                    ) : (
                        <>
                            <NavLink href="/login" active={pathname === "/login"}>Ingresar</NavLink>
                            <NavLink href="/register" active={pathname === "/register"}>Registrarse</NavLink>
                        </>
                    )}
                    <Link
                        href="/cart"
                        aria-label={`Carrito, ${itemCount} artículos`}
                        className={cn(
                            "vf-frame vf-focus osd text-sm px-3 py-2 ml-2 flex items-center gap-2 text-osd",
                            itemCount > 0 && "is-locked",
                        )}
                    >
                        Carrito <span className="tabular-nums">{count}</span>
                    </Link>
                </div>

                <div className="flex md:hidden items-center gap-1">
                    <Link
                        href="/cart"
                        aria-label={`Carrito, ${itemCount} artículos`}
                        className={cn("vf-frame vf-focus osd text-sm text-osd px-3 min-h-11 inline-flex items-center", itemCount > 0 && "is-locked")}
                    >
                        Carrito {count}
                    </Link>
                    <button
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className="w-11 h-11 inline-flex items-center justify-center text-osd cursor-pointer"
                        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {menuOpen && (
                <nav className="md:hidden border-t border-hud-line bg-lb px-4 py-3 flex flex-col osd text-base" aria-label="Menú">
                    <Link href="/catalog" onClick={close} className="py-3 border-b border-hud-line">Catálogo</Link>
                    <Link href="/arrepentimiento" onClick={close} className="py-3 border-b border-hud-line">Botón de arrepentimiento</Link>
                    {session ? (
                        <>
                            <Link href="/orders" onClick={close} className="py-3 border-b border-hud-line">Mis pedidos</Link>
                            <Link href="/account" onClick={close} className="py-3 border-b border-hud-line">Mi cuenta</Link>
                            <div className="flex items-center justify-between pt-3">
                                <span className="text-sm text-osd-dim normal-case tracking-normal font-sans">{session.email}</span>
                                <LogoutButton />
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login" onClick={close} className="py-3 border-b border-hud-line">Ingresar</Link>
                            <Link href="/register" onClick={close} className="py-3 text-pj-ink inline-flex items-center gap-2">Registrarse <ArrowRight size={16} aria-hidden="true" /></Link>
                        </>
                    )}
                </nav>
            )}
        </header>
    );
}
