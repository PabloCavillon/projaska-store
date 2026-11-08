import type { ReactNode } from "react";
import { LEGAL } from "@/lib/store-contact";

/** Contenedor de las páginas legales: título, fecha de actualización y texto legible. */
export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
    return (
        <article className="max-w-3xl mx-auto">
            <header className="border-b border-hud-line pb-4 mb-8">
                <h1 className="osd text-4xl">{title}</h1>
                <p className="osd text-xs text-osd-dim mt-3">Última actualización: {LEGAL.updated}</p>
            </header>
            <div className="max-w-xl space-y-4 text-base leading-relaxed text-pretty [&_h2]:text-balance [&_h2]:font-[family-name:var(--font-share-tech-mono)] [&_h2]:uppercase [&_h2]:tracking-[0.06em] [&_h2]:text-lg [&_h2]:pt-6 [&_h2]:text-osd [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-pj-ink [&_a]:underline [&_a]:underline-offset-4">
                {children}
            </div>
        </article>
    );
}
