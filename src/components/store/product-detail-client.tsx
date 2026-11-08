'use client';

import { StoreProduct } from "@/actions/store/products.actions";
import { AddToCartControls } from "@/components/store/add-to-cart-controls";
import { cn, fmtArs } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StockReadout } from "./vf-parts";

export function ProductDetailClient({ product }: { product: StoreProduct }) {
    const router = useRouter();
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

    // Por encargo: sin límite de cantidad (undefined = sin tope)
    const maxQuantity = product.isMadeToOrder
        ? undefined
        : selectedUnit === "box"
            ? Math.floor(product.stock / product.unitsPerBox!)
            : product.stock;

    return (
        <div className="flex flex-col gap-7">
            <button
                onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
                className="osd text-xs text-osd-dim hover:text-osd cursor-pointer w-fit inline-flex items-center gap-2"
            >
                <ArrowLeft size={14} aria-hidden="true" /> Volver
            </button>

            <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl leading-tight text-balance">{product.name}</h1>
                <div className="flex items-center gap-4 flex-wrap text-sm">
                    <StockReadout stock={product.stock} isMadeToOrder={product.isMadeToOrder} />
                    {product.offerDiscountPct !== null && product.offerUnit !== null && (
                        <span className="osd bg-osd text-lb px-2 py-0.5 text-xs">
                            −{product.offerDiscountPct}% por {product.offerUnit === "box" ? "caja" : "unidad"}
                        </span>
                    )}
                </div>
            </div>

            {product.description && (
                <p className="text-base text-osd-dim leading-relaxed whitespace-pre-line max-w-[65ch] border-t border-hud-line pt-6">
                    {product.description}
                </p>
            )}

            {hasBox && (
                <div>
                    <p className="vf-label">Presentación</p>
                    <div className="grid grid-cols-2 border border-hud-line osd text-sm max-w-xs" role="group" aria-label="Presentación">
                        {(["unit", "box"] as const).map((u) => (
                            <button
                                key={u}
                                onClick={() => setUnit(u)}
                                aria-pressed={unit === u}
                                className={cn("py-2.5 cursor-pointer", unit === u ? "bg-osd text-lb" : "text-osd-dim hover:text-osd")}
                            >
                                {u === "unit" ? "Por unidad" : `Caja ×${product.unitsPerBox}`}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="border-t border-hud-line pt-6 space-y-1">
                <p className="vf-label">Precio ARS</p>
                {offerApplies && <p className="osd text-base text-osd-dim line-through">{fmtArs(regularPriceArs)}</p>}
                <p className="osd text-5xl leading-none">{fmtArs(displayPriceArs)}</p>
                {selectedUnit === "box" && (
                    <p className="osd text-xs text-osd-dim pt-2">
                        {offerApplies
                            ? `Oferta: ${fmtArs(product.offerPriceArs!)} por caja de ${product.unitsPerBox} unidades`
                            : `${fmtArs(product.priceArs)} × ${product.unitsPerBox} unidades`}
                    </p>
                )}
            </div>

            <AddToCartControls
                item={{
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
                }}
                maxQuantity={maxQuantity}
            />

            <Link href="/cart" className="osd text-xs text-osd-dim hover:underline underline-offset-4 w-fit inline-flex items-center gap-2">
                Ver carrito <ArrowRight size={16} aria-hidden="true" />
            </Link>
        </div>
    );
}
