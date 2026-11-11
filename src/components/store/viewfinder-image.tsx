import { Package } from "lucide-react";
import Image from "next/image";

interface Props {
    src: string | null;
    alt: string;
    topLeft: string;
    topRight?: string;
    bottomLeft?: string;
    dim?: boolean;
}

/** Imagen de ficha en el visor: corchetes grandes y lecturas en las esquinas. */
export function ViewfinderImage({ src, alt, topLeft, topRight, bottomLeft, dim }: Props) {
    return (
        <div className="vf-frame vf-frame-lg p-3 sm:p-4">
        <div className={`${src ? "vf-plate" : "bg-hud"} relative w-full aspect-[4/3] md:aspect-square overflow-hidden`}>
            {src ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="(min-width: 768px) 45vw, 100vw"
                    className={dim ? "object-scale-down p-6 md:p-12 opacity-40 grayscale" : "object-scale-down p-6 md:p-12"}
                    unoptimized
                    priority
                />
            ) : (
                <span className="absolute inset-0 flex items-center justify-center opacity-40"><Package size={80} /></span>
            )}
            <span className="osd absolute top-5 left-6 text-xs">{topLeft}</span>
            {topRight && <span className="osd absolute top-5 right-6 text-xs">{topRight}</span>}
            {bottomLeft && <span className="osd absolute bottom-5 left-6 text-xs">{bottomLeft}</span>}
            {dim && <span className="zebra absolute inset-x-0 bottom-0 h-3 opacity-60" aria-hidden="true" />}
        </div>
        </div>
    );
}
