'use client';

import { cn } from "@/lib/utils";
import { useEffect, useState, type ReactNode } from "react";

type SceneId = "entrance" | "garage" | "warehouse" | "perimeter";

interface Feed {
    cam: string;
    label: string;
    scene: SceneId;
    ir?: boolean;
    /** Video o imagen real en /public (ej. "/cams/acceso.mp4"). Sin src se dibuja la escena. */
    src?: string;
}

const FEEDS: Feed[] = [
    { cam: "CAM 01", label: "Acceso principal", scene: "entrance" },
    { cam: "CAM 02", label: "Cochera", scene: "garage" },
    { cam: "CAM 03", label: "Depósito", scene: "warehouse" },
    { cam: "CAM 04", label: "Perímetro", scene: "perimeter", ir: true },
];

const ROTATE_MS = 8000;
const pad = (n: number) => String(n).padStart(2, "0");

/** Reloj del grabador. Arranca vacío para que el HTML del servidor y del navegador coincidan. */
function useClock() {
    const [now, setNow] = useState<Date | null>(null);
    useEffect(() => {
        const tick = () => setNow(new Date());
        const first = setTimeout(tick, 0);
        const id = setInterval(tick, 1000);
        return () => { clearTimeout(first); clearInterval(id); };
    }, []);
    if (!now) return "-- -- ---- --:--:--";
    return `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

/** Portada como vista de cámara: la toma ocupa todo el hero, con el OSD del grabador y el contenido encima. */
export function CameraWall({ children }: { children: ReactNode }) {
    const [main, setMain] = useState(0);
    const [paused, setPaused] = useState(false);
    const clock = useClock();

    useEffect(() => {
        if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const id = setInterval(() => setMain((m) => (m + 1) % FEEDS.length), ROTATE_MS);
        return () => clearInterval(id);
    }, [paused]);

    const feed = FEEDS[main];

    return (
        <section className="vf-frame vf-frame-lg relative overflow-hidden bg-black min-h-[min(calc(100svh-9rem),48rem)] flex flex-col">
            <FeedPicture feed={feed} />
            {/* Oscurece el lado del texto para que se lea sobre cualquier toma */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(0_0_0/0.8),rgb(0_0_0/0.45)_55%,rgb(0_0_0/0.1))]" aria-hidden="true" />

            <div className="relative flex-1 flex flex-col gap-10 px-5 py-6 sm:px-10 sm:py-9 [text-shadow:0_1px_2px_rgb(0_0_0/0.9)]">
                <div className="osd flex items-start justify-between gap-4 text-xs sm:text-sm">
                    <span className="flex items-center gap-2">
                        <span className="vf-rec inline-block w-2.5 h-2.5 rounded-full bg-rec" aria-hidden="true" />
                        <span>Rec</span>
                        <span className="ml-2">{feed.cam}</span>
                        <span className="text-osd-dim hidden sm:inline">{feed.label}</span>
                    </span>
                    <span className="tabular-nums text-right">{clock}</span>
                </div>

                <div className="flex-1 flex items-center">{children}</div>

                <div className="flex items-end justify-between gap-4">
                    <div
                        className="grid grid-cols-4 gap-2 w-full max-w-sm"
                        role="group"
                        aria-label="Cámaras"
                        onMouseEnter={() => setPaused(true)}
                        onMouseLeave={() => setPaused(false)}
                        onFocus={() => setPaused(true)}
                        onBlur={() => setPaused(false)}
                    >
                        {FEEDS.map((f, i) => (
                            <button
                                key={f.cam}
                                type="button"
                                onClick={() => setMain(i)}
                                aria-pressed={i === main}
                                aria-label={`Ver ${f.cam}, ${f.label}`}
                                className={cn(
                                    "vf-frame vf-focus relative aspect-video overflow-hidden bg-black cursor-pointer",
                                    i === main && "is-locked",
                                )}
                            >
                                <FeedPicture feed={f} still />
                                <span className="osd absolute left-1.5 bottom-1 text-[11px] text-osd">{f.cam.replace("CAM ", "")}</span>
                            </button>
                        ))}
                    </div>
                    <span className="osd text-xs text-osd-dim shrink-0 hidden sm:inline">{feed.ir ? "IR · " : ""}1080P · 25FPS</span>
                </div>
            </div>
        </section>
    );
}

/** La imagen de la cámara con el tratamiento de CCTV: blanco y negro, grano, líneas y viñeta. */
function FeedPicture({ feed, still }: { feed: Feed; still?: boolean }) {
    const media = feed.src
        ? /\.(mp4|webm)$/i.test(feed.src)
            ? <video src={feed.src} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
            // eslint-disable-next-line @next/next/no-img-element -- imagen decorativa de fondo, sin next/image
            : <img src={feed.src} alt="" className="absolute inset-0 w-full h-full object-cover" />
        : <Scene id={feed.scene} animate={!still} />;

    return (
        <div className={cn("absolute inset-0 cctv", feed.ir && "cctv-ir")} aria-hidden="true">
            {media}
            {!still && <span className="cctv-grain" />}
            <span className="cctv-lines" />
            <span className="cctv-vignette" />
        </div>
    );
}

/** Escenas dibujadas en perspectiva de cámara de techo. Tonos planos: el filtro CCTV hace el resto. */
function Scene({ id, animate }: { id: SceneId; animate: boolean }) {
    const common = { viewBox: "0 0 320 180", preserveAspectRatio: "xMidYMid slice", className: "absolute inset-0 w-full h-full" } as const;

    if (id === "entrance") {
        return (
            <svg {...common}>
                <rect width="320" height="180" fill="#3a3a3a" />
                {/* pared del fondo y puerta vidriada */}
                <polygon points="70,20 250,20 250,105 70,105" fill="#5b5b5b" />
                <rect x="132" y="32" width="56" height="73" fill="#2a2a2a" />
                <rect x="136" y="36" width="23" height="69" fill="#8c8c8c" />
                <rect x="161" y="36" width="23" height="69" fill="#7a7a7a" />
                <rect x="155" y="66" width="2" height="10" fill="#222" />
                <rect x="163" y="66" width="2" height="10" fill="#222" />
                {/* paredes laterales y piso */}
                <polygon points="0,0 70,20 70,105 0,180" fill="#454545" />
                <polygon points="320,0 250,20 250,105 320,180" fill="#4e4e4e" />
                <polygon points="70,105 250,105 320,180 0,180" fill="#6a6a6a" />
                <polygon points="110,105 210,105 250,180 70,180" fill="#787878" opacity="0.6" />
                {/* luz de techo */}
                <ellipse cx="160" cy="140" rx="90" ry="22" fill="#9a9a9a" opacity="0.35" />
                <rect x="40" y="48" width="14" height="22" fill="#9c9c9c" />
                {/* persona caminando */}
                <g className={animate ? "cctv-walk" : undefined}>
                    <ellipse cx="0" cy="168" rx="11" ry="3" fill="#2b2b2b" opacity="0.6" />
                    <circle cx="0" cy="112" r="6" fill="#1f1f1f" />
                    <rect x="-7" y="118" width="14" height="28" rx="4" fill="#1f1f1f" />
                    <rect x="-6" y="144" width="5" height="23" fill="#1a1a1a" />
                    <rect x="1" y="144" width="5" height="23" fill="#1a1a1a" />
                </g>
            </svg>
        );
    }

    if (id === "garage") {
        return (
            <svg {...common}>
                <rect width="320" height="180" fill="#2e2e2e" />
                <polygon points="0,62 320,62 320,180 0,180" fill="#5a5a5a" />
                <polygon points="0,0 320,0 320,62 0,62" fill="#3c3c3c" />
                {/* líneas de estacionamiento en perspectiva */}
                {[-40, 40, 120, 200, 280, 360].map((x, i) => (
                    <line key={i} x1={x * 0.55 + 72} y1="66" x2={x} y2="180" stroke="#b5b5b5" strokeWidth="2.5" />
                ))}
                <line x1="0" y1="66" x2="320" y2="66" stroke="#9a9a9a" strokeWidth="1.5" />
                {/* columna */}
                <rect x="236" y="10" width="20" height="120" fill="#6d6d6d" />
                <rect x="236" y="96" width="20" height="10" fill="#c4c4c4" />
                {/* auto estacionado */}
                <g>
                    <ellipse cx="128" cy="150" rx="62" ry="10" fill="#1c1c1c" opacity="0.7" />
                    <rect x="70" y="106" width="118" height="40" rx="12" fill="#262626" />
                    <path d="M92 108 L106 84 L156 84 L172 108 Z" fill="#202020" />
                    <path d="M101 106 L111 89 L151 89 L162 106 Z" fill="#6f6f6f" />
                    <rect x="74" y="118" width="14" height="7" rx="2" fill="#d9d9d9" />
                    <rect x="170" y="118" width="14" height="7" rx="2" fill="#d9d9d9" />
                    <circle cx="94" cy="146" r="9" fill="#111" />
                    <circle cx="164" cy="146" r="9" fill="#111" />
                </g>
                {/* tubos de luz */}
                <rect x="40" y="14" width="70" height="4" fill="#d6d6d6" />
                <rect x="170" y="22" width="50" height="3" fill="#c9c9c9" />
            </svg>
        );
    }

    if (id === "warehouse") {
        return (
            <svg {...common}>
                <rect width="320" height="180" fill="#353535" />
                <polygon points="120,58 200,58 320,180 0,180" fill="#5e5e5e" />
                <polygon points="120,58 200,58 200,40 120,40" fill="#4a4a4a" />
                {/* estanterías izquierda y derecha */}
                <polygon points="0,10 120,40 120,58 0,180" fill="#272727" />
                <polygon points="320,10 200,40 200,58 320,180" fill="#2c2c2c" />
                {[0, 1, 2, 3].map((i) => {
                    const t = i / 4;
                    return (
                        <g key={i}>
                            <line x1={0} y1={40 + i * 36} x2={120} y2={44 + i * 4} stroke="#8a8a8a" strokeWidth="1.5" />
                            <line x1={320} y1={40 + i * 36} x2={200} y2={44 + i * 4} stroke="#8a8a8a" strokeWidth="1.5" />
                            <rect x={8 + t * 70} y={18 + i * 34 - t * 20} width={22 - t * 12} height={16 - t * 8} fill="#9b9b9b" />
                            <rect x={36 + t * 64} y={20 + i * 34 - t * 20} width={18 - t * 10} height={14 - t * 7} fill="#7e7e7e" />
                            <rect x={290 - t * 64} y={18 + i * 34 - t * 20} width={22 - t * 12} height={16 - t * 8} fill="#a3a3a3" />
                            <rect x={262 - t * 60} y={21 + i * 34 - t * 20} width={18 - t * 10} height={13 - t * 7} fill="#858585" />
                        </g>
                    );
                })}
                <ellipse cx="160" cy="120" rx="50" ry="40" fill="#9a9a9a" opacity="0.18" />
                {/* pallet en el pasillo */}
                <rect x="138" y="128" width="44" height="22" fill="#8f8f8f" />
                <rect x="138" y="150" width="44" height="5" fill="#4c4c4c" />
            </svg>
        );
    }

    // perimeter (noche, infrarrojo)
    return (
        <svg {...common}>
            <rect width="320" height="180" fill="#1d1d1d" />
            <rect y="92" width="320" height="88" fill="#4a4a4a" />
            <ellipse cx="250" cy="150" rx="120" ry="40" fill="#7d7d7d" opacity="0.35" />
            {/* árboles */}
            <circle cx="40" cy="58" r="30" fill="#2c2c2c" />
            <circle cx="78" cy="48" r="24" fill="#262626" />
            <circle cx="290" cy="52" r="34" fill="#2a2a2a" />
            {/* reja */}
            <line x1="0" y1="78" x2="320" y2="72" stroke="#a5a5a5" strokeWidth="2" />
            <line x1="0" y1="118" x2="320" y2="110" stroke="#a5a5a5" strokeWidth="2" />
            {Array.from({ length: 21 }, (_, i) => (
                <line key={i} x1={i * 16} y1={78 - i * 0.3} x2={i * 16} y2={120 - i * 0.4} stroke="#9a9a9a" strokeWidth="1.6" />
            ))}
            {/* portón */}
            <rect x="196" y="70" width="64" height="44" fill="none" stroke="#c9c9c9" strokeWidth="2.5" />
            <line x1="228" y1="70" x2="228" y2="114" stroke="#c9c9c9" strokeWidth="2" />
            {/* poste de luz */}
            <rect x="150" y="18" width="3" height="80" fill="#6b6b6b" />
            <circle cx="151" cy="18" r="5" fill="#e6e6e6" />
        </svg>
    );
}
