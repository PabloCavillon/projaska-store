import { jsonLdHtml } from "@/lib/utils";
import { getStoreProduct } from "@/actions/store/products.actions";
import { ProductDetailClient } from "@/components/store/product-detail-client";
import { ViewfinderImage } from "@/components/store/viewfinder-image";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getStoreProduct(id);
    if (!product) return { title: "Producto no encontrado" };
    const description = product.description
        ?? `Comprá ${product.name} en Projaska — tecnología y seguridad para profesionales.`;
    return {
        title: product.name,
        description,
        alternates: { canonical: `/products/${id}` },
        openGraph: {
            title: `${product.name} | Projaska`,
            description,
            url: `/products/${id}`,
            type: "website",
            ...(product.imageUrl && { images: [{ url: product.imageUrl, alt: product.name }] }),
        },
        twitter: {
            card: "summary_large_image",
            title: product.name,
            description,
            ...(product.imageUrl && { images: [product.imageUrl] }),
        },
    };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getStoreProduct(id);
    if (!product) notFound();

    const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.name,
        description: product.description ?? undefined,
        image: product.imageUrl ?? undefined,
        sku: product.sku,
        offers: {
            "@type": "Offer",
            priceCurrency: "ARS",
            price: product.priceArs,
            availability: product.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
        },
    };

    return (
        <div className="max-w-6xl mx-auto">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-start">
                <div className="md:sticky md:top-24">
                    <ViewfinderImage
                        src={product.imageUrl}
                        alt={product.name}
                        topLeft={product.sku}
                        topRight={product.offerDiscountPct !== null && product.offerUnit !== null ? `−${product.offerDiscountPct}%` : undefined}
                        bottomLeft={product.category}
                        dim={product.stock === 0 && !product.isMadeToOrder}
                    />
                </div>

                {/* Info + controles (client) — incluye botón volver */}
                <ProductDetailClient product={product} />
            </div>
        </div>
    );
}
