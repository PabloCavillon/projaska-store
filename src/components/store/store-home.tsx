import type { StoreProduct } from "@/actions/store/products.actions";
import type { StoreKit } from "@/actions/store/kits.actions";
import { AddToCartControls } from "@/components/store/add-to-cart-controls";
import { Catalog } from "@/components/store/catalog";
import { fmtArs } from "@/lib/utils";
import { ZoomBar } from "@/components/store/vf-parts";
import { whatsappUrl } from "@/lib/store-contact";
import { Boxes, ArrowDown, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const pad = (n: number) => String(n).padStart(2, "0");

export function StoreHome({ products, kits, dollarRate }: { products: StoreProduct[]; kits: StoreKit[]; dollarRate: number }) {
    const featured = kits[0];

    return (
        <div className="space-y-10 sm:space-y-14">
            {/* Visor: portada. Las esquinas llevan lecturas reales, no slogans. */}
            <section className="vf-frame vf-frame-lg relative px-5 py-6 sm:px-10 sm:py-9 lg:min-h-[min(calc(100svh-9rem),48rem)] flex flex-col gap-10">
                <div className="osd flex items-start justify-between gap-4 text-xs sm:text-sm">
                    <span className="flex items-center gap-2">
                        <span className="vf-rec inline-block w-2.5 h-2.5 rounded-full bg-osd" aria-hidden="true" />
                        <span>Rec</span>
                        <span className="text-osd-dim ml-2 hidden sm:inline">Tecnología y seguridad · AR</span>
                    </span>
                    <span className="text-right">
                        <span className="text-osd-dim">Dólar de referencia</span><br />
                         1 USD = {fmtArs(dollarRate)}
                    </span>
                </div>

                <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 flex-1 items-center">
                    <div className="lg:col-span-6 flex flex-col gap-7">
                        <h1 className="osd text-[2.6rem] leading-[0.95] sm:text-6xl xl:text-[5.5rem] tracking-[0.02em] text-balance">
                            Seguridad completa.<br />
                            <span className="text-pj-ink">Instalada.</span>
                        </h1>
                        <p className="text-base sm:text-lg text-osd-dim max-w-[46ch] leading-relaxed">
                            Kits armados que resuelven una necesidad entera, asesoramiento técnico antes y después
                            de la compra, e instalación del mismo equipo que te lo vende. Precios en pesos, con stock real.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <a href="#catalogo" className="vf-btn vf-btn-primary">
                                Ver catálogo <ArrowDown size={16} aria-hidden="true" />
                            </a>
                            <a
                                href={whatsappUrl("Hola! Quería asesoramiento para elegir equipos.")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="vf-btn vf-btn-ghost"
                            >
                                Pedir asesoramiento
                            </a>
                        </div>
                    </div>

                    {featured && (
                        <div className="lg:col-span-6 grid sm:grid-cols-[1fr_auto] lg:grid-cols-1 xl:grid-cols-[1fr_18rem] gap-6 items-end">
                            <Link
                                href={`/kits/${featured.id}`}
                                className={`vf-frame vf-focus relative block aspect-[4/3] ${featured.imageUrl ? "vf-plate" : "bg-hud"}`}
                                aria-label={`Ver ${featured.name}`}
                            >
                                {featured.imageUrl ? (
                                    <Image
                                        src={featured.imageUrl}
                                        alt=""
                                        fill
                                        sizes="(min-width: 1024px) 35vw, 90vw"
                                        className="object-contain p-10"
                                        unoptimized
                                        priority
                                    />
                                ) : (
                                    <span className="absolute inset-0 flex items-center justify-center opacity-40"><Boxes size={72} /></span>
                                )}
                                {/* Retícula central */}
                                <span className="absolute left-1/2 top-1/2 w-5 h-px -translate-x-1/2 bg-current opacity-50" aria-hidden="true" />
                                <span className="absolute left-1/2 top-1/2 h-5 w-px -translate-y-1/2 bg-current opacity-50" aria-hidden="true" />
                                <span className="osd absolute top-3 left-4 text-xs">{featured.sku}</span>
                                <span className="osd absolute bottom-3 right-4 text-xs">{featured.items.length} componentes</span>
                            </Link>

                            <div className="flex flex-col gap-4 min-w-0">
                                <div>
                                    <p className="text-lg leading-snug">{featured.name}</p>
                                    <ul className="osd text-xs text-osd-dim mt-2 space-y-1">
                                        {featured.items.slice(0, 4).map((item, i) => (
                                            <li key={i} className="flex gap-2">
                                                <span className="tabular-nums">{item.quantity}×</span>
                                                <span className="normal-case tracking-normal font-sans truncate">{item.productName ?? item.childKitName}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <p className="osd text-3xl">{fmtArs(featured.priceArs)}</p>
                                <AddToCartControls
                                    item={{
                                        cartKey: `kit:${featured.id}`,
                                        type: "kit",
                                        id: featured.id,
                                        name: featured.name,
                                        sku: featured.sku,
                                        priceUsd: featured.priceUsd,
                                        imageUrl: featured.imageUrl,
                                        unit: "unit",
                                        isOffer: false,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="osd grid grid-cols-2 sm:grid-cols-3 items-end gap-4 text-xs">
                    <span className="text-osd-dim">{pad(products.length)} productos<br />{pad(kits.length)} kits</span>
                    <ZoomBar level={0.08} ticks={36} className="hidden sm:flex justify-self-center" />
                    <a
                        href={whatsappUrl("Hola! Quería consultar por una instalación.")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-right text-osd hover:text-pj-ink justify-self-end inline-flex items-end gap-2"
                    >
                        <span>Instalación propia<br /><span className="text-osd-dim">Consultar por WhatsApp</span></span> <ArrowRight size={16} aria-hidden="true" />
                    </a>
                </div>
            </section>

            <div id="catalogo" className="scroll-mt-16 space-y-10 sm:space-y-14">
                <Catalog products={products} kits={kits} />
            </div>
        </div>
    );
}
