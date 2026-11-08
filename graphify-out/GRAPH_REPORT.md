# Graph Report - projaska-store  (2026-11-07)

## Corpus Check
- Corpus is ~45,534 words - fits in a single context window. You may not need a graph.

## Summary
- 744 nodes · 1907 edges · 31 communities (23 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.85)
- Token cost: 159,483 input · 0 output

## Community Hubs (Navigation)
- Orders & PDF Receipts
- Store Auth & Forms
- Dashboard Shell & Push
- Seeds & Store Catalog Data
- Storefront Cart & Tests
- Pricing Config & Products
- Viewfinder Design System
- Expenses
- Customers Admin
- Kits Admin
- Users Admin
- Runtime Dependencies
- Dev Dependencies
- Dashboard Charts
- TypeScript Config
- Package Manifest
- Stock Movements
- Local Postgres Compose
- Root Layout & Analytics
- npm Scripts
- ESLint Config
- Vitest Config
- Test Setup
- App Icon 512
- Cart Layout
- Zod
- PostCSS Config
- App Icon 192
- Service Worker
- Spanish Store Copy
- API Route Handlers

## God Nodes (most connected - your core abstractions)
1. `next` - 75 edges
2. `lucide-react` - 68 edges
3. `cn()` - 52 edges
4. `auth` - 49 edges
5. `react` - 39 edges
6. `getPriceConfig()` - 19 edges
7. `prisma` - 19 edges
8. `getStoreSession()` - 19 edges
9. `fmtArs()` - 17 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `robots.txt crawl rules (disallow /admin, /api; sitemap)` --references--> `Admin Area (src/app/admin)`  [INFERRED]
  public/robots.txt → PRODUCT.md
- `The Viewfinder (Creative North Star)` --semantically_similar_to--> `Product Principles (trust before persuasion, pro + newcomer, kits hero, advice as product)`  [INFERRED] [semantically similar]
  DESIGN.md → PRODUCT.md
- `Home Viewfinder Frame (hero)` --references--> `PriceConfig dollar rate (ARS pricing)`  [INFERRED]
  DESIGN.md → PRODUCT.md
- `Evidence on Hand (no testimonials, no contact channel yet)` --rationale_for--> `Home Viewfinder Frame (hero)`  [INFERRED]
  PRODUCT.md → DESIGN.md
- `PriceConfigFormProps` --references--> `SerializedPriceConfig`  [EXTRACTED]
  src/components/config/price-config-form.tsx → src/actions/config.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Corner-bracket state system across components** — design_corner_brackets, design_buttons, design_cards, design_inputs, design_channel_bar, design_caution_amber_rule [EXTRACTED 1.00]
- **DESIGN.md named rules constraining the viewfinder world** — design_caution_amber_rule, design_one_action_rule, design_lit_plate_rule, design_readout_rule, design_no_lift_rule [EXTRACTED 1.00]
- **OSD readout components showing data as camera overlay** — design_readout_rule, design_stock_readout, design_rec_readout, design_zoom_bar, design_channel_bar [INFERRED 0.85]

## Communities (31 total, 8 thin omitted)

### Community 0 - "Orders & PDF Receipts"
Cohesion: 0.05
Nodes (62): @react-pdf/renderer@^4.3.3, @react-pdf/renderer, createOrder(), getOrder(), getOrders(), nanoid, serializeOrder(), updateOrderStatus() (+54 more)

### Community 1 - "Store Auth & Forms"
Cohesion: 0.06
Nodes (45): nextConfig, @hookform/resolvers@^5.2.2, react-hook-form@^7.72.0, @hookform/resolvers, next, react-hook-form, loginStoreCustomer(), logoutStoreCustomer() (+37 more)

### Community 2 - "Dashboard Shell & Push"
Cohesion: 0.05
Nodes (33): next-auth, react, getVapidPublicKey(), subscribeToPush(), unsubscribeFromPush(), DashboardLayout(), dynamic, metadata (+25 more)

### Community 3 - "Seeds & Store Catalog Data"
Cohesion: 0.07
Nodes (35): dotenv@^17.3.1, dotenv, main(), images, main(), main(), getPriceConfig(), getStoreKit() (+27 more)

### Community 4 - "Storefront Cart & Tests"
Cohesion: 0.11
Nodes (40): vitest@^4.1.4, @testing-library/react, @testing-library/user-event, vitest, StoreKit, StoreProduct, CartPage(), AddToCartControls() (+32 more)

### Community 5 - "Pricing Config & Products"
Cohesion: 0.10
Nodes (32): DollarRateResult, fetchOfficialDollarRate(), SerializedPriceConfig, updatePriceConfig(), createProduct(), deleteProduct(), getProduct(), serialize() (+24 more)

### Community 6 - "Viewfinder Design System"
Cohesion: 0.06
Nodes (33): Next.js Agent Rules (breaking-changes notice), CLAUDE.md includes AGENTS.md, Buttons (primary / ghost instrument keys), Cards / Containers, Channel Bar (signature component), Instrument Color Palette (letterbox, hud, osd, pj, caution, plate), Corner Brackets, Home Viewfinder Frame (hero) (+25 more)

### Community 7 - "Expenses"
Cohesion: 0.10
Nodes (33): createExpense(), createRecurringExpense(), deleteExpense(), deleteRecurringExpense(), ExpenseSummary, getExpenses(), getExpenseSummary(), getRecurringExpenses() (+25 more)

### Community 8 - "Customers Admin"
Cohesion: 0.11
Nodes (29): lucide-react, createCustomer(), deleteCustomer(), getCustomer(), getCustomers(), serialize(), updateCustomer(), deleteKit() (+21 more)

### Community 9 - "Kits Admin"
Cohesion: 0.11
Nodes (25): createKit(), deductKitStock(), getKit(), getKits(), itemInclude, KitItemWithRels, serializeItem(), serializeKit() (+17 more)

### Community 10 - "Users Admin"
Cohesion: 0.13
Nodes (23): createUser(), deleteUser(), getUser(), getUsers(), requireAdmin(), serialize(), updateUser(), EditUserPage() (+15 more)

### Community 11 - "Runtime Dependencies"
Cohesion: 0.07
Nodes (26): dependencies, bcryptjs@^3.0.3, clsx@^2.1.1, install@^0.13.0, jose@^6.2.2, lucide-react@^1.7.0, next@16.2.1, next-auth@^5.0.0-beta.30 (+18 more)

### Community 12 - "Dev Dependencies"
Cohesion: 0.08
Nodes (25): devDependencies, jsdom@^29.0.2, tailwindcss@^4, @tailwindcss/postcss@^4, @testing-library/react@^16.3.2, @testing-library/user-event@^14.6.1, ts-node@^10.9.2, @types/bcryptjs@^2.4.6 (+17 more)

### Community 13 - "Dashboard Charts"
Cohesion: 0.17
Nodes (15): recharts, getDashboardData(), DashboardPage(), LowStockTable(), Product, OrdersByStatusChart(), Props, SalesByMonthChart() (+7 more)

### Community 14 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 15 - "Package Manifest"
Cohesion: 0.11
Nodes (17): nanoid@^5.1.7, @neondatabase/serverless@^1.0.2, npm@^11.12.1, @prisma/client@^7.5.0, @radix-ui/react-tooltip@^1.2.8, react-dom@19.2.4, web-push@^3.6.7, name (+9 more)

### Community 16 - "Stock Movements"
Cohesion: 0.25
Nodes (11): createStockMovement(), getStockMovements(), serializedMovement(), metadata, StockPage(), StockMovementForm(), StockTable(), StockMovementFormData (+3 more)

### Community 17 - "Local Postgres Compose"
Cohesion: 0.17
Nodes (11): environment, image, ports, volumes, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, services (+3 more)

### Community 18 - "Root Layout & Analytics"
Cohesion: 0.20
Nodes (7): @vercel/analytics@^2.0.1, @vercel/speed-insights@^2.0.0, @vercel/analytics, @vercel/speed-insights, geistMono, geistSans, metadata

### Community 19 - "npm Scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, lint, postinstall, seed, start, test (+1 more)

### Community 20 - "ESLint Config"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.2.1, eslint, eslint-config-next

### Community 21 - "Vitest Config"
Cohesion: 0.40
Nodes (4): vite-tsconfig-paths@^6.1.1, @vitejs/plugin-react@^6.0.1, vite-tsconfig-paths, @vitejs/plugin-react

### Community 23 - "App Icon 512"
Cohesion: 0.67
Nodes (3): Projaska App Icon (512px), Brand Blue #147AB9, Projaska Brand Mark (blue crescent eye/lens logo)

## Knowledge Gaps
- **15 isolated node(s):** `{GET, POST}`, `CLAUDE.md includes AGENTS.md`, `Navigation (OSD links, cart, mobile)`, `Quantity Stepper`, `Free-text product category (catalog grouping)` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 184 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Store Auth & Forms` to `Orders & PDF Receipts`, `Dashboard Shell & Push`, `Seeds & Store Catalog Data`, `Storefront Cart & Tests`, `Pricing Config & Products`, `Expenses`, `Customers Admin`, `Kits Admin`, `Users Admin`, `Runtime Dependencies`, `Dashboard Charts`, `Package Manifest`, `Stock Movements`, `Root Layout & Analytics`?**
  _High betweenness centrality (0.230) - this node is a cross-community bridge._
- **What connects `{GET, POST}`, `CLAUDE.md includes AGENTS.md`, `Navigation (OSD links, cart, mobile)` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Orders & PDF Receipts` be split into smaller, more focused modules?**
  _Cohesion score 0.05378151260504202 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Customers Admin` to `Orders & PDF Receipts`, `Store Auth & Forms`, `Dashboard Shell & Push`, `Seeds & Store Catalog Data`, `Storefront Cart & Tests`, `Pricing Config & Products`, `Expenses`, `Kits Admin`, `Users Admin`, `Runtime Dependencies`, `Dashboard Charts`, `Package Manifest`, `Stock Movements`?**
  _High betweenness centrality (0.163) - this node is a cross-community bridge._
- **Should `Store Auth & Forms` be split into smaller, more focused modules?**
  _Cohesion score 0.06349206349206349 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Dashboard Shell & Push` to `Orders & PDF Receipts`, `Store Auth & Forms`, `Seeds & Store Catalog Data`, `Storefront Cart & Tests`, `Pricing Config & Products`, `Expenses`, `Customers Admin`, `Kits Admin`, `Users Admin`, `Runtime Dependencies`, `Dashboard Charts`, `Package Manifest`, `Stock Movements`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Should `Dashboard Shell & Push` be split into smaller, more focused modules?**
  _Cohesion score 0.05389610389610389 - nodes in this community are weakly interconnected._