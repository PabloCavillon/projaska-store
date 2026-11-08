'use client';

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    UserCircle,
    Users as TeamIcon,
    Database,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ScrollText,
    Settings,
    Receipt,
    Boxes,
} from "lucide-react";
import { PushSubscribeButton } from "@/components/layout/push-subscribe-button";

const navigation = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ["ADMIN", "SELLER", "WATCHER"] },
    { label: "Órdenes", href: "/admin/orders", icon: ScrollText, roles: ["ADMIN", "SELLER", "WAREHOUSE"] },
    { label: "Productos", href: "/admin/products", icon: Package, roles: ["ADMIN", "SELLER"] },
    { label: "Clientes", href: "/admin/customers", icon: UserCircle, roles: ["ADMIN", "SELLER"] },
    { label: "Stock", href: "/admin/stock", icon: Database, roles: ["ADMIN"] },
    { label: "Kits", href: "/admin/kits", icon: Boxes, roles: ["ADMIN", "SELLER"] },
    { label: "Gastos", href: "/admin/expenses", icon: Receipt, roles: ["ADMIN", "SELLER"] },
    { label: "Usuarios", href: "/admin/users", icon: TeamIcon, roles: ["ADMIN"] },
    { label: "Tienda", href: "/", icon: ShoppingCart, roles: ["ADMIN", "SELLER", "WATCHER"] },
    { label: "Configuración", href: "/admin/config", icon: Settings, roles: ["ADMIN"] },
];

export default function SidebarClient({ role }: { role: string }) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    const filteredNavigation = navigation.filter(item =>
        !item.roles || item.roles.includes(role)
    );

    const mobileNav = filteredNavigation;

    return (
        <>
            {/* ── DESKTOP: sidebar lateral ── */}
            <aside
                className={`
                    hidden md:flex flex-col bg-white border-r border-zinc-200 transition-[width] duration-200 ease-out h-screen sticky top-0
                    ${collapsed ? "w-20" : "w-64"}
                `}
            >
                {/* Header / Logo */}
                <div className={`flex items-center h-20 px-5 border-b border-zinc-200 ${collapsed ? "justify-center" : "justify-between"}`}>
                    {!collapsed && (
                        <Link href="/admin" className="flex items-center gap-3 min-w-0">
                            {/* eslint-disable-next-line @next/next/no-img-element -- logo fijo de /public */}
                            <img src="/icon-192.png" alt="" width={32} height={32} className="shrink-0" />
                            <span className="flex flex-col leading-tight">
                                <span className="uppercase text-base text-zinc-900">Projaska</span>
                                <span className="uppercase text-[11px] text-zinc-500">Panel de gestión</span>
                            </span>
                        </Link>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-6 flex flex-col gap-1.5">
                    {filteredNavigation.map((item) => {
                        const isActive = item.href === "/admin" || item.href === "/"
                            ? pathname === item.href
                            : pathname === item.href || pathname.startsWith(item.href + "/");
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={isActive ? "page" : undefined}
                                className={`
                                    vf-frame vf-focus flex items-center gap-3 px-3 py-2.5 group
                                    ${collapsed ? "justify-center" : ""}
                                    ${isActive ? "is-locked bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:text-zinc-900"}
                                `}
                                title={collapsed ? item.label : undefined}
                            >
                                <Icon size={20} className={isActive ? "text-pj" : "text-zinc-400 group-hover:text-zinc-900"} />
                                {!collapsed && (
                                    <span className="uppercase text-sm">
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sign out + theme */}
                <div className="p-4 border-t border-zinc-200 flex flex-col gap-1">
                    <PushSubscribeButton collapsed={collapsed} />
                    <ThemeToggle
                        showLabel={!collapsed}
                        className={`
                            w-full flex items-center gap-3 px-3 py-3 uppercase text-sm text-zinc-500
                            hover:bg-zinc-100 hover:text-zinc-900
                            ${collapsed ? "justify-center" : ""}
                        `}
                    />
                    <button
                        onClick={() => signOut({ callbackUrl: "/admin/login" })}
                        className={`
                            w-full flex items-center gap-3 px-3 py-3 uppercase text-sm text-zinc-500
                            hover:bg-red-50 hover:text-red-600 cursor-pointer
                            ${collapsed ? "justify-center" : ""}
                        `}
                        title={collapsed ? "Cerrar sesión" : undefined}
                    >
                        <LogOut size={20} />
                        {!collapsed && <span>Cerrar sesión</span>}
                    </button>
                </div>
            </aside>

            {/* ── MOBILE: bottom navigation bar ── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 safe-area-inset-bottom">
                <div className="flex items-center overflow-x-auto scrollbar-none px-1">
                    {mobileNav.map((item) => {
                        const isActive = item.href === "/admin" || item.href === "/"
                            ? pathname === item.href
                            : pathname === item.href || pathname.startsWith(item.href + "/");
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={isActive ? "page" : undefined}
                                className={`vf-frame vf-focus flex flex-col items-center gap-1 px-3 py-2.5 shrink-0 min-w-14 ${isActive ? "is-locked text-zinc-900" : "text-zinc-500"}`}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} className={isActive ? "text-pj" : undefined} />
                                <span className="text-[11px] uppercase leading-none">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}

                    {/* Theme toggle */}
                    <ThemeToggle className="flex flex-col items-center gap-1 px-3 py-2.5 text-zinc-500 hover:text-zinc-900 shrink-0 min-w-14" />
                    {/* Push notifications */}
                    <PushSubscribeButton />

                    {/* Logout */}
                    <button
                        onClick={() => signOut({ callbackUrl: "/admin/login" })}
                        className="flex flex-col items-center gap-1 px-3 py-2.5 text-zinc-500 hover:text-red-500 shrink-0 min-w-14 cursor-pointer"
                    >
                        <LogOut size={20} strokeWidth={1.8} />
                        <span className="text-[11px] uppercase leading-none">Salir</span>
                    </button>
                </div>
            </nav>

            {/* Espaciado para que el contenido no quede tapado por la bottom bar */}
            <div className="md:hidden h-16" />
        </>
    );
}