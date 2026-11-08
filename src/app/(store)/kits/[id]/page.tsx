import { getStoreKit } from "@/actions/store/kits.actions";
import { AddToCartControls } from "@/components/store/add-to-cart-controls";
import { ViewfinderImage } from "@/components/store/viewfinder-image";
import { fmtArs } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const kit = await getStoreKit(id);
    if (!kit) return { title: "Kit no encontrado" };
    const description = kit.description
        ?? `Comprá el kit ${kit.name} en Projaska — tecnología y seguridad para profesionales.`;
    return {
        title: kit.name,
        description,
        alternates: { canonical: `/kits/${id}` },
        openGraph: {
            title: `${kit.name} | Projaska`,
            description,
            url: `/kits/${id}`,
            type: "website",
            ...(kit.imageUrl && { images: [{ url: kit.imageUrl, alt: kit.name }] }),
        },
        twitter: {
            card: "summary_large_image",
            title: kit.name,
            description,
            ...(kit.imageUrl && { images: [kit.imageUrl] }),
        },
    };
}

export default async function KitDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const kit = await getStoreKit(id);
    if (!kit) notFound();

    const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: kit.name,
        description: kit.description ?? undefined,
        image: kit.imageUrl ?? undefined,
        sku: kit.sku,
        offers: {
            "@type": "Offer",
            priceCurrency: "ARS",
            price: kit.priceArs,
            availability: "https://schema.org/InStock",
        },
    };

    return (
        <div className="max-w-6xl mx-auto">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-start">
                <div className="md:sticky md:top-24">
                    <ViewfinderImage src={kit.imageUrl} alt={kit.name} topLeft={kit.sku} topRight="Kit" bottomLeft={`${kit.items.length} componentes`} />
                </div>

                <div className="flex flex-col gap-7">
                    <Link href="/#ch-kits" className="osd text-xs text-osd-dim hover:text-osd w-fit inline-flex items-center gap-2">
                        <ArrowLeft size={14} aria-hidden="true" /> Volver a kits
                    </Link>

                    <h1 className="text-3xl sm:text-4xl leading-tight text-balance">{kit.name}</h1>

                    {kit.description && (
                        <p className="text-base text-osd-dim leading-relaxed whitespace-pre-line max-w-[65ch]">
                            {kit.description}
                        </p>
                    )}

                    <div className="border-t border-hud-line pt-6">
                        <p className="vf-label">Incluye</p>
                        <ul className="divide-y divide-hud-line border-y border-hud-line">
                            {kit.items.map((item, i) => (
                                <li key={i}>
                                    {item.productId ? (
                                        <Link href={`/products/${item.productId}`} className="group flex items-center gap-4 py-3 min-h-11 hover:text-pj-ink">
                                            <span className="osd text-osd-dim tabular-nums w-10 shrink-0">{item.quantity}×</span>
                                            <span className="flex-1 underline-offset-4 group-hover:underline">{item.productName}</span>
                                            <ArrowRight size={14} className="text-osd-dim shrink-0" aria-hidden="true" />
                                        </Link>
                                    ) : (
                                        <div className="flex items-center gap-4 py-3">
                                            <span className="osd text-osd-dim tabular-nums w-10 shrink-0">{item.quantity}×</span>
                                            <span className="flex-1">{item.childKitName}</span>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-1">
                        <p className="vf-label">Precio ARS</p>
                        <p className="osd text-5xl leading-none">{fmtArs(kit.priceArs)}</p>
                    </div>

                    {/* Controles de carrito */}
                    <AddToCartControls
                        item={{
                            cartKey: `kit:${kit.id}`,
                            type: "kit",
                            id: kit.id,
                            name: kit.name,
                            sku: kit.sku,
                            priceUsd: kit.priceUsd,
                            imageUrl: kit.imageUrl,
                            unit: "unit",
                            isOffer: false,
                        }}
                    />

                    <Link href="/cart" className="osd text-xs text-osd-dim hover:underline underline-offset-4 w-fit inline-flex items-center gap-2">
                        Ver carrito <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
