'use client';

import { useCart, CartItem } from "@/contexts/cart-context";
import { QtyStepper } from "./vf-parts";
import { ArrowRight } from "lucide-react";

interface Props {
    item: Omit<CartItem, "quantity">;
    maxQuantity?: number;
}

export function AddToCartControls({ item, maxQuantity }: Props) {
    const { addItem, updateQuantity, items } = useCart();
    const inCart = items.find((i) => i.cartKey === item.cartKey);
    const atMax = maxQuantity !== undefined && inCart !== undefined && inCart.quantity >= maxQuantity;

    if (inCart) {
        const unitLabel = item.unit === "box"
            ? `caja${inCart.quantity !== 1 ? "s" : ""}`
            : `unidad${inCart.quantity !== 1 ? "es" : ""}`;
        return (
            <div className="flex items-center gap-4 flex-wrap">
                <QtyStepper
                    quantity={inCart.quantity}
                    onChange={(q) => updateQuantity(item.cartKey, q)}
                    max={maxQuantity}
                    size="lg"
                    label={item.name}
                />
                <span className="osd text-sm text-osd-dim">
                    {inCart.quantity} {unitLabel} en el carrito
                    {atMax && <span className="block text-caution">Máximo disponible</span>}
                </span>
            </div>
        );
    }

    if (maxQuantity !== undefined && maxQuantity <= 0) {
        return (
            <div className="relative flex items-center justify-center py-4 border border-hud-line overflow-hidden">
                <span className="zebra absolute inset-0 opacity-15" aria-hidden="true" />
                <span className="osd relative text-sm text-osd bg-lb px-3">Sin stock disponible</span>
            </div>
        );
    }

    return (
        <button onClick={() => addItem(item)} className="vf-btn vf-btn-primary w-full sm:w-auto px-6 sm:px-10 py-4 text-base whitespace-nowrap">
            Agregar al carrito <ArrowRight size={16} aria-hidden="true" />
        </button>
    );
}
