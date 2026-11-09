'use client';

import { useCart } from "@/contexts/cart-context";
import { StoreProduct } from "@/actions/store/products.actions";
import { cn, fmtArs, fmtUsd } from "@/lib/utils";
import { Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { QtyStepper, StockReadout } from "./vf-parts";

export function ProductCard({ product }: { product: StoreProduct }) {
    const { addItem, updateQuantity, items } = useCart();
    const [imgError, setImgError] = useState(false);
    const [unit, setUnit] = useState<"unit" | "box">("unit");

    const hasBox = product.unitsPerBox !== null && product.unitsPerBox > 0;
    const selectedUnit = hasBox ? unit : "unit";

    const offerApplies = product.offerDiscountPct !== null && product.offerUnit === selectedUnit;

    let effectivePriceUsd: number;
    if (selectedUnit === "box") {
        effectivePriceUsd = offerApplies
            ? product.offerPriceUsd!
            : product.priceUsd * product.unitsPerBox!;
    } else {
        effectivePriceUsd = offerApplies ? product.offerPriceUsd! : product.priceUsd;
    }

    const regularPriceArs = selectedUnit === "box"
        ? product.priceArs * product.unitsPerBox!
        : product.priceArs;
    const displayPriceArs = offerApplies ? product.offerPriceArs! : regularPriceArs;

    const cartKey = `product:${product.id}:${selectedUnit}`;
    const inCart = items.find((i) => i.cartKey === cartKey);
    const soldOut = product.stock === 0 && !product.isMadeToOrder;

    const handleAdd = () => {
        addItem({
            cartKey,
            type: "product",
            id: product.id,
            name: product.name,
            sku: product.sku,
            priceUsd: effectivePriceUsd,
            imageUrl: product.imageUrl,
            unit: selectedUnit,
            unitsPerBox: selectedUnit === "box" ? product.unitsPerBox! : undefined,
            isOffer: offerApplies,
            isMadeToOrder: product.isMadeToOrder,
        });
    };

    const hasOffer = product.offerDiscountPct !== null && product.offerUnit !== null;

    return (
        <article className={cn("vf-frame vf-focus bg-lb flex flex-col p-3 sm:p-4 gap-3", inCart && "is-locked")}>
            <Link href={`/products/${product.id}`} className={cn(product.imageUrl && !imgError ? "vf-plate" : "bg-hud", "block relative aspect-square overflow-hidden")} tabIndex={-1} aria-hidden="true">
                {product.imageUrl && !imgError ? (
                    <Image
                        src={product.imageUrl}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                        className={cn("object-contain p-4", soldOut && "opacity-40 grayscale")}
                        onError={() => setImgError(true)}
                        unoptimized
                    />
                ) : (
                    <span className="absolute inset-0 flex items-center justify-center opacity-40"><Package size={36} /></span>
                )}
                <span className="osd absolute top-2 left-2 text-[11px]">{product.sku}</span>
                {hasOffer && (
                    <span className="osd absolute top-2 right-2 text-[11px] bg-lb text-osd px-1.5 py-0.5">
                        −{product.offerDiscountPct}%{product.offerUnit === "box" && " caja"}
                    </span>
                )}
                {soldOut && <span className="zebra absolute inset-x-0 bottom-0 h-2 opacity-70" />}
            </Link>

            <div className="flex-1 flex flex-col gap-1">
                {product.brand && <span className="osd text-[11px] text-osd-dim uppercase truncate">{product.brand}</span>}
                <Link href={`/products/${product.id}`} className="text-sm leading-snug line-clamp-2 hover:underline underline-offset-4">
                    {product.name}
                </Link>
                <StockReadout stock={product.stock} isMadeToOrder={product.isMadeToOrder} className="text-[11px]" />
            </div>

            {hasBox && (
                <div className="grid grid-cols-2 border border-hud-line osd text-[11px]" role="group" aria-label="Presentación">
                    {(["unit", "box"] as const).map((u) => (
                        <button
                            key={u}
                            onClick={() => setUnit(u)}
                            aria-pressed={unit === u}
                            className={cn("py-1.5 cursor-pointer", unit === u ? "bg-osd text-lb" : "text-osd-dim hover:text-osd")}
                        >
                            {u === "unit" ? "Unidad" : `Caja ×${product.unitsPerBox}`}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex items-end justify-between gap-2">
                <div>
                    {offerApplies && <span className="osd block text-[11px] text-osd-dim line-through">{fmtArs(regularPriceArs)}</span>}
                    <p className="osd text-lg sm:text-xl leading-none">{fmtArs(displayPriceArs)}</p>
                    <span className="osd block text-[11px] text-osd-dim mt-1 tabular-nums">{fmtUsd(displayPriceArs / product.dollarRate)}</span>
                </div>
            </div>

            {soldOut ? (
                <p className="osd text-xs text-osd-dim text-center py-2.5 border border-hud-line">No disponible</p>
            ) : inCart ? (
                <QtyStepper
                    quantity={inCart.quantity}
                    onChange={(q) => updateQuantity(cartKey, q)}
                    max={product.isMadeToOrder ? undefined : selectedUnit === "box" ? Math.floor(product.stock / product.unitsPerBox!) : product.stock}
                    label={product.name}
                    className="self-center"
                />
            ) : (
                <button onClick={handleAdd} className="vf-btn vf-btn-primary w-full py-2.5 text-xs min-h-11 md:min-h-0">
                    {product.stock === 0 ? "Pedir por encargo" : "Agregar"}
                </button>
            )}
        </article>
    );
}
