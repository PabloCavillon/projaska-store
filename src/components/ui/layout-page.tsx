import Link from 'next/link';
import { Plus } from 'lucide-react';

interface PageLayoutProps {
    title: string;
    subtitle: string;
    icon: React.ElementType;
    buttonText: string;
    buttonHref: string;
    children: React.ReactNode; // Aquí irá la tabla específica
}

export const PageLayout = ({
    title,
    subtitle,
    icon: Icon,
    buttonText,
    buttonHref,
    children
}: PageLayoutProps) => {
    return (
        <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-6 md:space-y-8">

            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-100 rounded-xl shrink-0">
                            <Icon className="w-5 h-5 text-zinc-900" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tighter text-zinc-900">
                            {title}
                        </h1>
                    </div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">
                        {subtitle}
                    </p>
                </div>

                <Link
                    href={buttonHref}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 uppercase text-sm hover:bg-zinc-800 shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    {buttonText}
                </Link>
            </header>

            <div className="bg-white rounded-3xl border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                {children}
            </div>
        </div>
    );
};