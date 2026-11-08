# Graph Report - projaska-store  (2026-11-08)

## Corpus Check
- 215 files · ~58,153 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: .example 1, (none) 1, .toml 1)

## Summary
- 875 nodes · 2386 edges · 59 communities (47 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Admin Products & Kits
- Expenses & Dashboard Data
- User Management
- Forms & Validation Libs
- Push Notifications
- Design System (DESIGN.md)
- Customer Management
- Dev Dependencies
- Runtime Dependencies
- Price-Sync API (n8n)
- Cart & UI Tests
- Storefront Data Loading
- Legal & Revocation
- Store Pricing & Cart
- Shared UI Utilities
- Dashboard Charts
- Login Rate Limit & Store Auth
- TypeScript Config
- Prisma & Seed Scripts
- Store Checkout Orders
- Order Status Display
- PDF Receipts
- Admin Orders Table
- Price Config & Dollar Rate
- Store Session & Proxy
- Home Camera Wall
- Store Layout & Navbar
- Catalog & Search
- Docker Compose
- Product Principles
- Admin Auth (NextAuth)
- Vercel Analytics
- Unified Orders View
- Account Deletion
- My Orders Pages
- NPM Scripts
- Manual Order Creation
- Recent Orders Table
- NextAuth Types
- ESLint Config
- Vitest Config
- Account Tests & Seed
- Store Login Page
- Store Register Page
- Agent & Repo Docs
- React DOM & clsx
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
6. `assertString()` - 39 edges
7. `auth` - 31 edges
8. `getStoreSession()` - 28 edges
9. `prisma` - 26 edges
10. `getPriceConfig()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `OSD Readouts` --conceptually_related_to--> `Price as USD cost`  [INFERRED]
  DESIGN.md → docs/price-sync-api.md
- `robots.txt crawl rules (disallow /admin, /api; sitemap)` --references--> `Admin Area (src/app/admin)`  [INFERRED]
  public/robots.txt → PRODUCT.md
- `PriceConfigFormProps` --references--> `SerializedPriceConfig`  [EXTRACTED]
  src/components/config/price-config-form.tsx → src/actions/config.ts
- `getStoreKit()` --calls--> `getPriceConfig()`  [EXTRACTED]
  src/actions/store/kits.actions.ts → src/actions/config.ts
- `getStoreKits()` --calls--> `getPriceConfig()`  [EXTRACTED]
  src/actions/store/kits.actions.ts → src/actions/config.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Projaska named design rules** — design_caution_amber_rule, design_one_action_rule, design_lit_plate_rule, design_readout_rule, design_no_lift_rule [EXTRACTED 1.00]
- **Viewfinder signature elements** — design_corner_brackets, design_osd_readout, design_rec_readout, design_zoom_bar, design_channel_bar [INFERRED 0.85]
- **Price sync update flow (n8n -> auth -> validate -> update -> log)** — docs_price_sync_api_n8n_workflow, docs_price_sync_api_bearer_auth, docs_price_sync_api_match_set_body, docs_price_sync_api_post_update, docs_price_sync_api_productsynclog [EXTRACTED 1.00]

## Communities (59 total, 12 thin omitted)

### Community 0 - "Admin Products & Kits"
Cohesion: 0.05
Nodes (48): nextConfig, next, createKit(), deleteKit(), getKit(), getKits(), itemInclude, KitItemWithRels (+40 more)

### Community 1 - "Expenses & Dashboard Data"
Cohesion: 0.09
Nodes (39): getDashboardData(), createExpense(), createRecurringExpense(), deleteExpense(), deleteRecurringExpense(), ExpenseSummary, getExpenses(), getExpenseSummary() (+31 more)

### Community 2 - "User Management"
Cohesion: 0.14
Nodes (24): createUser(), deleteUser(), getUser(), getUsers(), requireAdmin(), serialize(), updateUser(), EditUserPage() (+16 more)

### Community 3 - "Forms & Validation Libs"
Cohesion: 0.12
Nodes (23): @hookform/resolvers@^5.2.2, react-hook-form@^7.72.0, zod@^4.3.6, @hookform/resolvers, react-hook-form, zod, createStockMovement(), getStockMovements() (+15 more)

### Community 4 - "Push Notifications"
Cohesion: 0.11
Nodes (20): getVapidPublicKey(), subscribeToPush(), unsubscribeFromPush(), DashboardLayout(), dynamic, metadata, LoginPage(), metadata (+12 more)

### Community 5 - "Design System (DESIGN.md)"
Cohesion: 0.07
Nodes (24): Admin focus-pull screen transition, Admin panel (.admin), Buttons (primary / ghost), Product Card, Catalog Grid Layout, Caution Amber, Channel Bar, Design System: Projaska (+16 more)

### Community 6 - "Customer Management"
Cohesion: 0.14
Nodes (21): createCustomer(), deleteCustomer(), getCustomer(), getCustomers(), serialize(), updateCustomer(), EditCustomerPage(), metadata (+13 more)

### Community 7 - "Dev Dependencies"
Cohesion: 0.10
Nodes (26): devDependencies, jsdom@^29.0.2, tailwindcss@^4, @tailwindcss/postcss@^4, @testing-library/jest-dom@^6.9.1, @types/bcryptjs@^2.4.6, @types/node@^20, @types/react@^19 (+18 more)

### Community 8 - "Runtime Dependencies"
Cohesion: 0.07
Nodes (27): dependencies, bcryptjs@^3.0.3, jose@^6.2.2, lucide-react@^1.7.0, nanoid@^5.1.7, @neondatabase/serverless@^1.0.2, next@16.2.1, prisma@^7.5.0 (+19 more)

### Community 9 - "Price-Sync API (n8n)"
Cohesion: 0.12
Nodes (20): Bearer token auth (PRICE_SYNC_API_KEY), GET /api/price-sync/products, Importadora Lococo (supplier), match/set/source update body, Prisma migration (Product.model + ProductSyncLog), n8n sync workflow, POST /api/price-sync/update, API de sincronizacion de precios (+12 more)

### Community 10 - "Cart & UI Tests"
Cohesion: 0.14
Nodes (21): @testing-library/react@^16.3.2, @testing-library/user-event@^14.6.1, vitest@^4.1.4, @testing-library/react, @testing-library/user-event, vitest, getReorderItems(), AddToCartControls() (+13 more)

### Community 11 - "Storefront Data Loading"
Cohesion: 0.15
Nodes (18): getStoreKit(), getStoreKits(), getBestSellerIds(), getStoreProduct(), getStoreProducts(), ReorderResult, CatalogPage(), metadata (+10 more)

### Community 12 - "Legal & Revocation"
Cohesion: 0.16
Nodes (16): createRevocationRequest(), nanoid, metadata, RevocationPage(), metadata, PrivacyPage(), metadata, TermsPage() (+8 more)

### Community 13 - "Store Pricing & Cart"
Cohesion: 0.23
Nodes (16): getPriceConfig(), mapProduct(), productSelect, createStoreOrder(), CartPage(), CartClient(), CartClientProps, CheckoutClient() (+8 more)

### Community 14 - "Shared UI Utilities"
Cohesion: 0.32
Nodes (11): react, KitCard(), ProductCard(), ProductDetailClient(), QtyInput(), QtyStepper(), QtyStepperProps, StockReadout() (+3 more)

### Community 15 - "Dashboard Charts"
Cohesion: 0.18
Nodes (14): recharts, DashboardPage(), LowStockTable(), Product, OrdersByStatusChart(), Props, SalesByMonthChart(), countCards (+6 more)

### Community 16 - "Login Rate Limit & Store Auth"
Cohesion: 0.22
Nodes (16): ACTIVE_ORDER_STATUSES, loginStoreCustomer(), registerStoreCustomer(), clearLoginFailures(), clientIp(), isLoginBlocked(), LOCKOUT_MESSAGE, LOCKOUT_MINUTES (+8 more)

### Community 17 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 18 - "Prisma & Seed Scripts"
Cohesion: 0.15
Nodes (9): dotenv@^17.3.1, dotenv, main(), images, main(), adapter, globalForPrisma, prisma (+1 more)

### Community 19 - "Store Checkout Orders"
Cohesion: 0.15
Nodes (15): CheckoutItem, CheckoutResult, getAdminStoreOrder(), getAdminStoreOrders(), getKitLeafProducts(), getMyStoreOrders(), nanoid, orderInclude (+7 more)

### Community 20 - "Order Status Display"
Cohesion: 0.25
Nodes (10): metadata, COLORS, Props, STATUS_DESCRIPTION, STATUS_FLOW, STATUS_LABEL, STATUS_STYLE, STORE_STATUS_FLOW (+2 more)

### Community 21 - "PDF Receipts"
Cohesion: 0.16
Nodes (14): @react-pdf/renderer@^4.3.3, @react-pdf/renderer, getOrder(), serializeOrder(), GET(), runtime, BUSINESS, fmt() (+6 more)

### Community 22 - "Admin Orders Table"
Cohesion: 0.23
Nodes (12): lucide-react, updateOrderStatus(), metadata, OrderDetailPage(), getNextLabel(), getNextStatus(), OrdersTable(), StatusBadge() (+4 more)

### Community 23 - "Price Config & Dollar Rate"
Cohesion: 0.25
Nodes (12): DollarRateResult, fetchOfficialDollarRate(), SerializedPriceConfig, updatePriceConfig(), ConfigPage(), metadata, PriceConfigForm(), PriceConfigFormProps (+4 more)

### Community 24 - "Store Session & Proxy"
Cohesion: 0.21
Nodes (11): jose, logoutStoreCustomer(), POST(), deleteStoreSession(), STORE_COOKIE_NAME, storeJwtSecret(), { auth }, config (+3 more)

### Community 25 - "Home Camera Wall"
Cohesion: 0.22
Nodes (13): StoreKit, StoreProduct, CameraWall(), Feed, FeedPicture(), FEEDS, pad(), Scene() (+5 more)

### Community 26 - "Store Layout & Navbar"
Cohesion: 0.23
Nodes (11): dynamic, metadata, StoreLayout(), LogoutButton(), ServiceWorkerRegistrar(), NavLink(), StoreNavbar(), StoreNavbarProps (+3 more)

### Community 27 - "Catalog & Search"
Cohesion: 0.26
Nodes (11): Catalog(), NoResults(), pad(), Section, SectionHead(), Channel, ChannelBar(), ChannelBarProps (+3 more)

### Community 28 - "Docker Compose"
Cohesion: 0.17
Nodes (11): environment, image, ports, volumes, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, services (+3 more)

### Community 29 - "Product Principles"
Cohesion: 0.18
Nodes (9): Admin Area (src/app/admin), Kits (product bundles, hero offer), PriceConfig dollar rate (ARS pricing), Projaska Store (product), PWA service worker + push notifications, StoreCustomer accounts (separate from admin users), Storefront (src/app/(store)), Users: Installers/technicians and end customers (Argentina) (+1 more)

### Community 30 - "Admin Auth (NextAuth)"
Cohesion: 0.27
Nodes (7): next-auth@^5.0.0-beta.30, next-auth, authConfig, handlers, LoginRateLimited, signIn, signOut

### Community 31 - "Vercel Analytics"
Cohesion: 0.20
Nodes (7): @vercel/analytics@^2.0.1, @vercel/speed-insights@^2.0.0, @vercel/analytics, @vercel/speed-insights, geistMono, geistSans, metadata

### Community 32 - "Unified Orders View"
Cohesion: 0.31
Nodes (8): getOrders(), AdminStoreOrder, metadata, OrdersPage(), fromOrder(), fromStoreOrder(), UnifiedOrder, UnifiedOrderItem

### Community 33 - "Account Deletion"
Cohesion: 0.33
Nodes (7): deleteStoreAccount(), AccountPage(), metadata, CheckoutPage(), metadata, DeleteAccountForm(), getStoreSession()

### Community 34 - "My Orders Pages"
Cohesion: 0.38
Nodes (7): getMyStoreOrder(), OrderDetailPage(), metadata, MyOrdersPage(), whatsappUrl(), STATUS_LABEL, STATUS_TONE

### Community 35 - "NPM Scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, lint, postinstall, seed, start, test (+1 more)

### Community 36 - "Manual Order Creation"
Cohesion: 0.44
Nodes (6): createOrder(), nanoid, OrderFormData, OrderFormInput, orderItemSchema, orderSchema

### Community 37 - "Recent Orders Table"
Cohesion: 0.31
Nodes (6): RecentOrdersTable(), OrderStatusTooltip(), Props, ChartOrder, SerializedOrderItem, SerializedProduct

### Community 38 - "NextAuth Types"
Cohesion: 0.29
Nodes (5): JWT, next-auth, next-auth/jwt, Session, User

### Community 39 - "ESLint Config"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.2.1, eslint, eslint-config-next

### Community 40 - "Vitest Config"
Cohesion: 0.40
Nodes (4): vite-tsconfig-paths@^6.1.1, @vitejs/plugin-react@^6.0.1, vite-tsconfig-paths, @vitejs/plugin-react

### Community 41 - "Account Tests & Seed"
Cohesion: 0.40
Nodes (4): bcryptjs, main(), auth, db

### Community 42 - "Store Login Page"
Cohesion: 0.50
Nodes (4): LoginPageProps, metadata, StoreLoginPage(), StoreLoginForm()

### Community 43 - "Store Register Page"
Cohesion: 0.50
Nodes (4): metadata, RegisterPageProps, StoreRegisterPage(), StoreRegisterForm()

### Community 44 - "Agent & Repo Docs"
Cohesion: 0.50
Nodes (4): Next.js Agent Rules (breaking-changes notice), CLAUDE.md includes AGENTS.md, Stack: Next.js 16, React 19, Tailwind 4, Prisma/Neon, Vercel Blob, README (create-next-app boilerplate)

### Community 45 - "React DOM & clsx"
Cohesion: 0.33
Nodes (4): clsx@^2.1.1, react-dom@19.2.4, clsx, react-dom

### Community 46 - "App Icon 512"
Cohesion: 0.67
Nodes (3): Projaska App Icon (512px), Brand Blue #147AB9, Projaska Brand Mark (blue crescent eye/lens logo)

## Knowledge Gaps
- **24 isolated node(s):** `{GET, POST}`, `CLAUDE.md includes AGENTS.md`, `Rec Red`, `OSD Dim`, `Share Tech Mono (display/label font)` (+19 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 221 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Admin Products & Kits` to `Expenses & Dashboard Data`, `User Management`, `Forms & Validation Libs`, `Push Notifications`, `Customer Management`, `Dev Dependencies`, `Runtime Dependencies`, `Price-Sync API (n8n)`, `Cart & UI Tests`, `Storefront Data Loading`, `Legal & Revocation`, `Store Pricing & Cart`, `Shared UI Utilities`, `Dashboard Charts`, `Login Rate Limit & Store Auth`, `Prisma & Seed Scripts`, `Store Checkout Orders`, `Order Status Display`, `PDF Receipts`, `Admin Orders Table`, `Price Config & Dollar Rate`, `Store Session & Proxy`, `Home Camera Wall`, `Store Layout & Navbar`, `Vercel Analytics`, `Account Deletion`, `My Orders Pages`, `Manual Order Creation`, `Recent Orders Table`, `Store Login Page`, `Store Register Page`?**
  _High betweenness centrality (0.270) - this node is a cross-community bridge._
- **What connects `{GET, POST}`, `CLAUDE.md includes AGENTS.md`, `Rec Red` to the rest of the system?**
  _24 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Products & Kits` be split into smaller, more focused modules?**
  _Cohesion score 0.054340396445659606 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Admin Orders Table` to `Admin Products & Kits`, `Expenses & Dashboard Data`, `User Management`, `Forms & Validation Libs`, `Push Notifications`, `Customer Management`, `Dev Dependencies`, `Runtime Dependencies`, `Cart & UI Tests`, `Storefront Data Loading`, `Legal & Revocation`, `Store Pricing & Cart`, `Shared UI Utilities`, `Dashboard Charts`, `Order Status Display`, `Price Config & Dollar Rate`, `Home Camera Wall`, `Store Layout & Navbar`, `Catalog & Search`, `Unified Orders View`, `Account Deletion`, `My Orders Pages`, `Manual Order Creation`, `Recent Orders Table`?**
  _High betweenness centrality (0.135) - this node is a cross-community bridge._
- **Should `Expenses & Dashboard Data` be split into smaller, more focused modules?**
  _Cohesion score 0.08521870286576169 - nodes in this community are weakly interconnected._
- **Why does `GET /api/price-sync/products` connect `Price-Sync API (n8n)` to `Design System (DESIGN.md)`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Should `User Management` be split into smaller, more focused modules?**
  _Cohesion score 0.1361344537815126 - nodes in this community are weakly interconnected._