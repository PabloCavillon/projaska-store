'use client';

import { useCart, type CartItem } from "@/contexts/cart-context";
import { calcDiscount, calcPriceArs, type DiscountConfig, type PriceInfo } from "@/lib/price-utils";
import { fmtArs } from "@/lib/utils";
import { QtyStepper } from "@/components/store/vf-parts";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

interface CartClientProps {
    config: (PriceInfo & DiscountConfig) | null;
    isGuild: boolean;
    loggedIn: boolean;
}

export function CartClient({ config, isGuild, loggedIn }: CartClientProps) {
    const { items, addItem, removeItem, updateQuantity } = useCart();
    const [removed, setRemoved] = useState<CartItem | null>(null);

    const remove = (item: CartItem) => {
        removeItem(item.cartKey);
        setRemoved(item);
    };
    const undo = () => {
        if (!removed) return;
        const { quantity, ...rest } = removed;
        addItem(rest);
        updateQuantity(removed.cartKey, quantity);
        setRemoved(null);
    };

    const undoBar = removed && (
        <div role="status" className="flex items-center justify-between gap-4 border border-hud-line bg-hud px-4 py-3 text-sm">
            <span className="min-w-0 truncate">Quitaste {removed.name}</span>
            <button onClick={undo} className="osd text-xs text-pj-ink hover:text-osd cursor-pointer shrink-0 min-h-11 px-2">
                Deshacer
            </button>
        </div>
    );

    if (items.length === 0) {
        return (
            <div className="max-w-2xl mx-auto space-y-4">
                {undoBar}
                <div className="border border-hud-line flex flex-col items-center justify-center py-28 px-6 text-center gap-5">
                    <p className="osd text-sm text-osd-dim">Carrito 00</p>
                    <p className="text-2xl">Tu carrito está vacío</p>
                    <p className="text-sm text-osd-dim -mt-2">Explorá el catálogo y agregá productos o kits.</p>
                    <Link href="/" className="vf-btn vf-btn-primary">Ver catálogo</Link>
                </div>
            </div>
        );
    }

    const totalUnits = items.reduce((a, i) => a + i.quantity, 0);
    const unitArs = (i: CartItem) => (config ? calcPriceArs(i.priceUsd, config) : null);
    const subtotalArs = config ? items.reduce((a, i) => a + calcPriceArs(i.priceUsd, config) * i.quantity, 0) : null;
    const discount = config && subtotalArs !== null ? calcDiscount(subtotalArs, config, isGuild) : null;
    const missingForVolume = config && subtotalArs !== null && config.volumeDiscountPct > 0
        ? config.volumeThresholdArs - subtotalArs
        : 0;

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-baseline justify-between border-b border-hud-line pb-4">
                <h1 className="osd text-4xl">Tu carrito</h1>
                <span className="osd text-sm text-osd-dim tabular-nums">{String(totalUnits).padStart(2, "0")} artículos</span>
            </div>

            {undoBar}

            <ul className="divide-y divide-hud-line">
                {items.map((item) => {
                    const unit = unitArs(item);
                    return (
                        <li key={item.cartKey} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-3 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                            <div className="min-w-0">
                                <p className="leading-snug">{item.name}</p>
                                <p className="osd text-xs text-osd-dim mt-1 flex gap-3 flex-wrap">
                                    <span>{item.sku}</span>
                                    {item.type === "kit" && <span className="text-osd">Kit</span>}
                                    {item.unit === "box" && <span>Caja ×{item.unitsPerBox}</span>}
                                    {item.isOffer && <span className="text-osd">Oferta</span>}
                                    {unit !== null && <span>{fmtArs(unit)} c/u</span>}
                                </p>
                            </div>
                            <p className="osd text-right sm:order-last sm:min-w-28">{unit !== null ? fmtArs(unit * item.quantity) : ""}</p>
                            <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                                <QtyStepper
                                    quantity={item.quantity}
                                    onChange={(q) => (q <= 0 ? remove(item) : updateQuantity(item.cartKey, q))}
                                    label={item.name}
                                />
                                {item.quantity > 1 && (
                                    <button
                                        onClick={() => remove(item)}
                                        className="osd text-xs text-osd-dim hover:text-osd cursor-pointer min-h-11 px-2"
                                    >
                                        Quitar
                                    </button>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>

            <div className="space-y-5 border-t border-hud-line pt-6">
                {subtotalArs !== null && discount && (
                    <dl className="osd space-y-3 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-osd-dim">Subtotal</dt>
                            <dd>{fmtArs(subtotalArs)}</dd>
                        </div>
                        {discount.pct > 0 && (
                            <div className="flex justify-between">
                                <dt>Descuento {discount.type === "GUILD" ? "gremio" : "por volumen"} ({discount.pct}%)</dt>
                                <dd>−{fmtArs(discount.amountArs)}</dd>
                            </div>
                        )}
                        <div className="flex justify-between items-baseline pt-4 border-t border-hud-line">
                            <dt>Total estimado</dt>
                            <dd className="text-3xl sm:text-4xl">{fmtArs(discount.totalArs)}</dd>
                        </div>
                    </dl>
                )}

                <div className="text-sm text-osd-dim leading-relaxed max-w-[60ch] space-y-2">
                    {discount && config && config.volumeDiscountPct > discount.pct && missingForVolume > 0 && (
                        <p>
                            Te faltan <span className="osd text-osd">{fmtArs(missingForVolume)}</span> para
                            el {config.volumeDiscountPct}% de descuento por volumen.
                        </p>
                    )}
                    <p>El total en pesos se confirma al coordinar el pago, según la cotización del día.</p>
                    {!loggedIn && <p>Para enviar el pedido vas a ingresar o crear una cuenta. Tu carrito se mantiene.</p>}
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <Link href="/" className="osd text-xs text-osd-dim hover:text-osd inline-flex items-center gap-2 min-h-11"><ArrowLeft size={14} aria-hidden="true" /> Seguir comprando</Link>
                    <Link href="/checkout" className="vf-btn vf-btn-primary sm:px-10">
                        Continuar <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
