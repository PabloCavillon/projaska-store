# Graph Report - projaska-store  (2026-11-08)

## Corpus Check
- 211 files · ~57,123 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: .example 1, (none) 1, .toml 1)

## Summary
- 859 nodes · 2286 edges · 39 communities (25 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.83)
- Token cost: 67,333 input · 0 output

## Community Hubs (Navigation)
- Storefront Catalog & Pricing
- Orders & PDF Receipts
- Admin Customers & Kits
- Store Auth & Routing
- Price-Sync API (n8n)
- Expenses & Dashboard Data
- App Layouts & Contact
- Products & Price Config
- Admin Auth & Push
- User Management
- Design System (DESIGN.md)
- Dev Dependencies
- Runtime Dependencies
- Dashboard Charts
- TypeScript Config
- Stock Movements
- Cart & UI Tests
- Docker Compose
- Product Principles
- Vercel Analytics
- NPM Scripts
- ESLint Config
- Vitest Config
- Agent & Repo Docs
- Search Normalization
- Test Setup
- App Icon 512
- Cart Layout
- Navigation & Zoom Bar
- PostCSS Config
- App Icon 192
- Service Worker
- Brand Identity
- Product Categories
- Theme Mode
- Spanish Voice
- NextAuth Route

## God Nodes (most connected - your core abstractions)
1. `next` - 85 edges
2. `lucide-react` - 74 edges
3. `cn()` - 57 edges
4. `react` - 47 edges
5. `requireRole()` - 39 edges
6. `auth` - 31 edges
7. `getStoreSession()` - 29 edges
8. `prisma` - 25 edges
9. `getPriceConfig()` - 21 edges
10. `fmtArs()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `OSD Readouts` --conceptually_related_to--> `Price as USD cost`  [INFERRED]
  DESIGN.md → docs/price-sync-api.md
- `robots.txt crawl rules (disallow /admin, /api; sitemap)` --references--> `Admin Area (src/app/admin)`  [INFERRED]
  public/robots.txt → PRODUCT.md
- `Props` --references--> `SerializedProduct`  [EXTRACTED]
  src/components/products/products-table.tsx → src/types/product.ts
- `setup()` --calls--> `AddToCartControls()`  [EXTRACTED]
  src/__tests__/components/add-to-cart-controls.test.tsx → src/components/store/add-to-cart-controls.tsx
- `CartTestConsumer()` --calls--> `useCart()`  [EXTRACTED]
  src/__tests__/contexts/cart-context.test.tsx → src/contexts/cart-context.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Price sync update flow (n8n -> auth -> validate -> update -> log)** — docs_price_sync_api_n8n_workflow, docs_price_sync_api_bearer_auth, docs_price_sync_api_match_set_body, docs_price_sync_api_post_update, docs_price_sync_api_productsynclog [EXTRACTED 1.00]
- **Projaska named design rules** — design_caution_amber_rule, design_one_action_rule, design_lit_plate_rule, design_readout_rule, design_no_lift_rule [EXTRACTED 1.00]
- **Viewfinder signature elements** — design_corner_brackets, design_osd_readout, design_rec_readout, design_zoom_bar, design_channel_bar [INFERRED 0.85]

## Communities (39 total, 14 thin omitted)

### Community 0 - "Storefront Catalog & Pricing"
Cohesion: 0.05
Nodes (92): getPriceConfig(), getStoreKit(), getStoreKits(), StoreKit, getBestSellerIds(), getStoreProduct(), getStoreProducts(), mapProduct() (+84 more)

### Community 1 - "Orders & PDF Receipts"
Cohesion: 0.05
Nodes (64): @react-pdf/renderer@^4.3.3, lucide-react, @react-pdf/renderer, createOrder(), getOrder(), getOrders(), nanoid, serializeOrder() (+56 more)

### Community 2 - "Admin Customers & Kits"
Cohesion: 0.05
Nodes (62): createCustomer(), deleteCustomer(), getCustomer(), getCustomers(), serialize(), updateCustomer(), createKit(), deleteKit() (+54 more)

### Community 3 - "Store Auth & Routing"
Cohesion: 0.06
Nodes (54): bcryptjs@^3.0.3, @hookform/resolvers@^5.2.2, jose@^6.2.2, react-hook-form@^7.72.0, bcryptjs, @hookform/resolvers, jose, react-hook-form (+46 more)

### Community 4 - "Price-Sync API (n8n)"
Cohesion: 0.06
Nodes (32): Bearer token auth (PRICE_SYNC_API_KEY), GET /api/price-sync/products, Importadora Lococo (supplier), match/set/source update body, Prisma migration (Product.model + ProductSyncLog), n8n sync workflow, POST /api/price-sync/update, API de sincronizacion de precios (+24 more)

### Community 5 - "Expenses & Dashboard Data"
Cohesion: 0.10
Nodes (33): getDashboardData(), createExpense(), createRecurringExpense(), deleteExpense(), deleteRecurringExpense(), ExpenseSummary, getExpenses(), getExpenseSummary() (+25 more)

### Community 6 - "App Layouts & Contact"
Cohesion: 0.08
Nodes (21): nextConfig, next, react, dynamic, metadata, LoginPage(), metadata, dynamic (+13 more)

### Community 7 - "Products & Price Config"
Cohesion: 0.11
Nodes (29): zod@^4.3.6, zod, DollarRateResult, fetchOfficialDollarRate(), SerializedPriceConfig, updatePriceConfig(), createProduct(), getProduct() (+21 more)

### Community 8 - "Admin Auth & Push"
Cohesion: 0.09
Nodes (25): next-auth@^5.0.0-beta.30, next-auth, getVapidPublicKey(), subscribeToPush(), unsubscribeFromPush(), DashboardLayout(), POST(), auth (+17 more)

### Community 9 - "User Management"
Cohesion: 0.14
Nodes (23): createUser(), deleteUser(), getUser(), getUsers(), requireAdmin(), serialize(), updateUser(), EditUserPage() (+15 more)

### Community 10 - "Design System (DESIGN.md)"
Cohesion: 0.07
Nodes (24): Admin focus-pull screen transition, Admin panel (.admin), Buttons (primary / ghost), Product Card, Catalog Grid Layout, Caution Amber, Channel Bar, Design System: Projaska (+16 more)

### Community 11 - "Dev Dependencies"
Cohesion: 0.11
Nodes (24): devDependencies, jsdom@^29.0.2, tailwindcss@^4, @tailwindcss/postcss@^4, @types/bcryptjs@^2.4.6, @types/node@^20, @types/react@^19, @types/react-dom@^19 (+16 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.08
Nodes (25): dependencies, clsx@^2.1.1, lucide-react@^1.7.0, nanoid@^5.1.7, @neondatabase/serverless@^1.0.2, next@16.2.1, @prisma/client@^7.5.0, @radix-ui/react-tooltip@^1.2.8 (+17 more)

### Community 13 - "Dashboard Charts"
Cohesion: 0.18
Nodes (15): recharts, DashboardPage(), LowStockTable(), Product, OrdersByStatusChart(), RecentOrdersTable(), Props, SalesByMonthChart() (+7 more)

### Community 14 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 15 - "Stock Movements"
Cohesion: 0.26
Nodes (11): createStockMovement(), getStockMovements(), serializedMovement(), metadata, StockPage(), StockMovementForm(), StockTable(), StockMovementFormData (+3 more)

### Community 16 - "Cart & UI Tests"
Cohesion: 0.19
Nodes (13): @testing-library/react@^16.3.2, @testing-library/user-event@^14.6.1, vitest@^4.1.4, @testing-library/react, @testing-library/user-event, vitest, CartProvider(), item (+5 more)

### Community 17 - "Docker Compose"
Cohesion: 0.17
Nodes (11): environment, image, ports, volumes, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, services (+3 more)

### Community 18 - "Product Principles"
Cohesion: 0.18
Nodes (9): Admin Area (src/app/admin), Kits (product bundles, hero offer), PriceConfig dollar rate (ARS pricing), Projaska Store (product), PWA service worker + push notifications, StoreCustomer accounts (separate from admin users), Storefront (src/app/(store)), Users: Installers/technicians and end customers (Argentina) (+1 more)

### Community 19 - "Vercel Analytics"
Cohesion: 0.20
Nodes (7): @vercel/analytics@^2.0.1, @vercel/speed-insights@^2.0.0, @vercel/analytics, @vercel/speed-insights, geistMono, geistSans, metadata

### Community 20 - "NPM Scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, lint, postinstall, seed, start, test (+1 more)

### Community 21 - "ESLint Config"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.2.1, eslint, eslint-config-next

### Community 22 - "Vitest Config"
Cohesion: 0.40
Nodes (4): vite-tsconfig-paths@^6.1.1, @vitejs/plugin-react@^6.0.1, vite-tsconfig-paths, @vitejs/plugin-react

### Community 23 - "Agent & Repo Docs"
Cohesion: 0.50
Nodes (4): Next.js Agent Rules (breaking-changes notice), CLAUDE.md includes AGENTS.md, Stack: Next.js 16, React 19, Tailwind 4, Prisma/Neon, Vercel Blob, README (create-next-app boilerplate)

### Community 26 - "App Icon 512"
Cohesion: 0.67
Nodes (3): Projaska App Icon (512px), Brand Blue #147AB9, Projaska Brand Mark (blue crescent eye/lens logo)

## Knowledge Gaps
- **24 isolated node(s):** `{GET, POST}`, `CLAUDE.md includes AGENTS.md`, `PriceConfig dollar rate (ARS pricing)`, `Free-text product category (catalog grouping)`, `StoreCustomer accounts (separate from admin users)` (+19 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 216 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `App Layouts & Contact` to `Storefront Catalog & Pricing`, `Orders & PDF Receipts`, `Admin Customers & Kits`, `Store Auth & Routing`, `Price-Sync API (n8n)`, `Expenses & Dashboard Data`, `Products & Price Config`, `Admin Auth & Push`, `User Management`, `Dev Dependencies`, `Runtime Dependencies`, `Dashboard Charts`, `Stock Movements`, `Vercel Analytics`?**
  _High betweenness centrality (0.282) - this node is a cross-community bridge._
- **What connects `{GET, POST}`, `CLAUDE.md includes AGENTS.md`, `PriceConfig dollar rate (ARS pricing)` to the rest of the system?**
  _24 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Storefront Catalog & Pricing` be split into smaller, more focused modules?**
  _Cohesion score 0.05083870967741935 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Orders & PDF Receipts` to `Storefront Catalog & Pricing`, `Admin Customers & Kits`, `Store Auth & Routing`, `Expenses & Dashboard Data`, `App Layouts & Contact`, `Products & Price Config`, `Admin Auth & Push`, `User Management`, `Dev Dependencies`, `Runtime Dependencies`, `Dashboard Charts`, `Stock Movements`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **Should `Orders & PDF Receipts` be split into smaller, more focused modules?**
  _Cohesion score 0.05303030303030303 - nodes in this community are weakly interconnected._
- **Why does `GET /api/price-sync/products` connect `Price-Sync API (n8n)` to `Design System (DESIGN.md)`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Should `Admin Customers & Kits` be split into smaller, more focused modules?**
  _Cohesion score 0.05276907001044932 - nodes in this community are weakly interconnected._