import type { StoreProduct } from "@/actions/store/products.actions";
import type { StoreKit } from "@/actions/store/kits.actions";
import { ProductCard } from "@/components/store/product-card";
import { CameraWall } from "@/components/store/camera-wall";
import { fmtArs } from "@/lib/utils";
import { whatsappUrl } from "@/lib/store-contact";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const pad = (n: number) => String(n).padStart(2, "0");

interface StoreHomeProps {
    products: StoreProduct[];
    kits: StoreKit[];
    bestSellers: StoreProduct[];
    /** false = todavía no hay ventas y se muestran productos con stock */
    bestSellersAreSales: boolean;
    dollarRate: number;
}

export function StoreHome({ products, kits, bestSellers, bestSellersAreSales, dollarRate }: StoreHomeProps) {
    return (
        <div className="space-y-10 sm:space-y-14">
            {/* Visor: portada. Las esquinas llevan lecturas reales, no slogans. */}
            <CameraWall>
                    <div className="flex flex-col gap-7 max-w-2xl">
                        <h1 className="osd text-[2.6rem] leading-[0.95] sm:text-6xl xl:text-[5.5rem] tracking-[0.02em] text-balance">
                            Seguridad completa.<br />
                            <span className="text-pj-ink">Instalada.</span>
                        </h1>
                        <p className="text-base sm:text-lg text-osd-dim max-w-[46ch] leading-relaxed">
                            Kits armados que resuelven una necesidad entera, asesoramiento técnico antes y después
                            de la compra, e instalación del mismo equipo que te lo vende. Precios en pesos, con stock real.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link href="/catalog" className="vf-btn vf-btn-primary">
                                Ver catálogo <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                            <a
                                href={whatsappUrl("Hola! Quería asesoramiento para elegir equipos.")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="vf-btn vf-btn-ghost"
                            >
                                Pedir asesoramiento
                            </a>
                        </div>
                        <p className="osd text-xs text-osd-dim tabular-nums">
                            1 USD = {fmtArs(dollarRate)} · {pad(products.length)} productos · {pad(kits.length)} kits
                        </p>
                    </div>
            </CameraWall>

            {bestSellers.length > 0 && (
                <section aria-labelledby="mas-vendidos" className="space-y-5">
                    <div className="flex items-baseline justify-between gap-4 border-b border-hud-line pb-3">
                        <h2 id="mas-vendidos" className="osd text-2xl sm:text-3xl">
                            {bestSellersAreSales ? "Más vendidos" : "Destacados"}
                        </h2>
                        <Link href="/catalog" className="osd text-xs text-osd-dim hover:text-osd inline-flex items-center gap-2 min-h-11 shrink-0">
                            Catálogo completo <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                        {bestSellers.map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                </section>
            )}

            <div className="flex justify-center">
                <Link href="/catalog" className="vf-btn vf-btn-ghost">
                    Ver los {products.length} productos y {kits.length} kits <ArrowRight size={16} aria-hidden="true" />
                </Link>
            </div>
        </div>
    );
}
