# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences in roughly equal measure:

- **Installers and technicians** buying security equipment (cameras, alarms, locks) to install for their own clients. They know the specs, compare prices and stock, and buy repeatedly.
- **End customers** (households and small businesses) who want to protect a home or shop and often need help choosing the right equipment.

Both buy from Argentina, in Argentine pesos, on mobile and desktop.

## Product Purpose

Projaska is an online store for technology and security equipment. The storefront (`src/app/(store)`) lets visitors browse the catalog by category, see kits and offers, add items to a cart, register or log in, check out, and follow their orders. An admin area (`src/app/admin`) manages products, stock, kits, orders, customers, expenses and pricing.

Success: visitors find the right equipment fast, trust the store enough to buy, and come back.

## Positioning

Projaska does not just resell boxes. It combines:

- **Ready-made kits** that cover a complete need (for example, a camera, a recorder and storage sold together).
- **Technical advice** before and after the sale.
- **Competitive prices with real stock.** Prices are calculated in ARS from a configurable dollar rate.
- **In-house installation**: the same team that sells also installs.

## Capabilities and Constraints

- Stack: Next.js 16 (App Router, with breaking changes; see AGENTS.md), React 19, Tailwind CSS 4, Prisma/Neon, lucide-react icons, and Vercel Blob for images.
- Prices are shown in ARS and depend on a `PriceConfig` dollar rate. The store shows an "unavailable" state when no rate is configured.
- Products have a free-text `category`, which the catalog groups by. Kits are bundles of products. Promos exist in the schema.
- There are separate store customer accounts (`StoreCustomer`) and admin users.
- Light and dark modes exist, toggled via a `.dark` class on `<html>`.
- PWA: a service worker and push notifications (for admins and sellers).
- Store copy is in Spanish (es-AR, voseo: "Explorá", "Tenés").

## Brand Commitments

- Name: **Projaska**. Current tagline: "Tecnología y Seguridad".
- The existing logo must be kept: a blue circular lens/eye mark (`public/icon-512.png`, `public/icon-192.png`, approximately `#147BBC`).
- Requested direction: the user wants the store to read as technology and security and to be minimalist, replacing the current generic look.

## Evidence on Hand

- Real product catalog, kits and prices live in the database.
- No testimonials, client logos, certifications, installation counts or case studies are in the repo. Do not invent them.
- No contact channel (WhatsApp, phone, address) is recorded yet for the advice or installation offer. Ask before showing one.

## Product Principles

1. **Trust before persuasion.** Security buyers are buying peace of mind; clarity, accurate stock and honest prices beat hype.
2. **Serve the pro and the newcomer.** Specs and fast reordering for installers; guidance, and kits as the answer, for end customers.
3. **Kits are the hero offer.** They express the "complete solution" positioning better than single SKUs.
4. **Advice and installation are part of the product**, not a footer line.
