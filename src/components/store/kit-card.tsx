'use client';

import { useCart } from "@/contexts/cart-context";
import { StoreKit } from "@/actions/store/kits.actions";
import { cn, fmtArs } from "@/lib/utils";
import { Boxes } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { QtyStepper } from "./vf-parts";

export function KitCard({ kit }: { kit: StoreKit }) {
    const { addItem, updateQuantity, items } = useCart();
    const [imgError, setImgError] = useState(false);

    const cartKey = `kit:${kit.id}`;
    const inCart = items.find((i) => i.cartKey === cartKey);

    const handleAdd = () => {
        addItem({
            cartKey,
            type: "kit",
            id: kit.id,
            name: kit.name,
            sku: kit.sku,
            priceUsd: kit.priceUsd,
            imageUrl: kit.imageUrl,
            unit: "unit",
            isOffer: false,
        });
    };

    return (
        <article className={cn("vf-frame vf-focus bg-lb flex flex-col p-3 sm:p-4 gap-3", inCart && "is-locked")}>
            <Link href={`/kits/${kit.id}`} className={cn(kit.imageUrl && !imgError ? "vf-plate" : "bg-hud", "block relative aspect-square overflow-hidden")} tabIndex={-1} aria-hidden="true">
                {kit.imageUrl && !imgError ? (
                    <Image
                        src={kit.imageUrl}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                        className="object-contain p-4"
                        onError={() => setImgError(true)}
                        unoptimized
                    />
                ) : (
                    <span className="absolute inset-0 flex items-center justify-center opacity-40"><Boxes size={36} /></span>
                )}
                <span className="osd absolute top-2 left-2 text-[11px]">{kit.sku}</span>
                <span className="osd absolute top-2 right-2 text-[11px]">Kit</span>
            </Link>

            <div className="flex-1 flex flex-col gap-2">
                <Link href={`/kits/${kit.id}`} className="text-sm leading-snug line-clamp-2 hover:underline underline-offset-4">
                    {kit.name}
                </Link>
                <ul className="osd text-[11px] text-osd-dim space-y-0.5">
                    {kit.items.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex gap-2">
                            <span className="tabular-nums shrink-0">{item.quantity}×</span>
                            <span className="truncate normal-case tracking-normal font-sans">{item.productName ?? item.childKitName}</span>
                        </li>
                    ))}
                    {kit.items.length > 3 && <li>+{kit.items.length - 3} componentes</li>}
                </ul>
            </div>

            <p className="osd text-lg sm:text-xl leading-none">{fmtArs(kit.priceArs)}</p>

            {inCart ? (
                <QtyStepper quantity={inCart.quantity} onChange={(q) => updateQuantity(cartKey, q)} label={kit.name} />
            ) : (
                <button onClick={handleAdd} className="vf-btn vf-btn-primary w-full py-2.5 text-xs min-h-11 md:min-h-0">Agregar</button>
            )}
        </article>
    );
}
