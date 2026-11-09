import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/seo";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});


export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		template: "%s | Projaska",
		default: "Projaska — Cámaras de seguridad, alarmas y cerraduras",
	},
	description: "Cámaras de seguridad, alarmas, cerraduras inteligentes y kits listos para instalar. Stock real, asesoramiento técnico e instalación. Envíos a todo el país.",
	authors: [{ name: "Projaska" }],
	creator: "Projaska",
	robots: { index: true, follow: true, googleBot: { "max-image-preview": "large", "max-snippet": -1 } },
	...(process.env.GOOGLE_SITE_VERIFICATION && { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }),
	openGraph: {
		type: "website",
		locale: "es_AR",
		url: SITE_URL,
		siteName: "Projaska",
		title: "Projaska — Tecnología y Seguridad",
		description: "Tienda online de tecnología y seguridad para profesionales. Cámaras, alarmas, cerraduras y más.",
		images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "Projaska" }],
	},
	twitter: {
		card: "summary",
		title: "Projaska — Tecnología y Seguridad",
		description: "Tienda online de tecnología y seguridad para profesionales.",
		images: ["/icon-512.png"],
	},
	icons: {
		icon: [
			{ url: "/icon-192.png", type: "image/png", sizes: "192x192" },
			{ url: "/icon-512.png", type: "image/png", sizes: "512x512" },
		],
		apple: { url: "/icon-192.png", sizes: "192x192" },
		shortcut: "/favicon.ico",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="es-AR"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
			suppressHydrationWarning
		>
			<head>
				<meta name="theme-color" content="#111827" />
				{/* Aplica el tema antes de que React hidrate para evitar flash */}
				<script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('theme');if(location.pathname.startsWith('/admin')||t==='dark'||(t===null&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}` }} />
			</head>
			<body className="min-h-full flex flex-col">
				{children}
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}