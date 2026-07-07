# Architecture

This document explains how the codebase is organized and why. Read it once before your first change; after that it's a reference.

## The big picture

TeeHub is **one Next.js application that contains both the storefront and the backend**. Payload CMS runs inside the app as a set of routes — it isn't a separate service. That single decision explains most of the layout:

- There is one `src/` tree, one `package.json`, one server.
- The split you'd normally see between "frontend repo" and "backend repo" shows up here as two **route groups** inside `src/app/`: `(storefront)` for shoppers and `(payload)` for the CMS and API.
- Server code talks to the database through Payload's **Local API** (direct function calls), not through HTTP. The REST endpoints exist mainly for the admin panel, the browser-side auth/cart calls, and the WooCommerce webhook.

```
teehub-frontend/
├── payload.config.ts        ← the backend, effectively: collections, access rules, hooks, plugins
├── payload-types.ts         ← generated TypeScript types for every collection (do not edit by hand)
├── scripts/                 ← WooCommerce migration/sync CLI scripts
├── public/                  ← static assets (images, SVG team logos, fonts)
└── src/
    ├── app/                 ← all routes (Next.js App Router)
    │   ├── (storefront)/    ← customer-facing pages
    │   ├── (payload)/       ← admin panel + API routes
    │   ├── globals.css      ← Tailwind + global styles
    │   ├── sitemap.ts, robots.ts, manifest.ts
    │   └── icon.png, apple-icon.png
    ├── components/          ← React components, grouped by area
    ├── lib/                 ← data access, business logic, shared helpers
    └── migrations/          ← versioned database migrations
```

## `payload.config.ts` — the data model

This single file defines the whole backend: every collection (database table), its fields, access rules, and hooks. It's long but deliberately self-contained. The collections:

| Collection | What it holds |
| --- | --- |
| `admins` | Staff accounts for the admin panel. |
| `customers` | Shopper accounts: auth, verification/reset code fields, saved addresses, a synced cart, order stats. |
| `categories` | Shop categories — name, slug, menu thumbnail, display order. |
| `products` | The catalog. Card image and detail gallery are separate; includes pricing, sizes, filter facets, and per-image "fit" (crop/zoom) data. |
| `orders` | Orders with line items **snapshotted at purchase time**, so later product edits never rewrite order history. |
| `webhook-events` | Log of WooCommerce webhook deliveries, used for idempotency and debugging. |
| `pages` | Rich-text policy/static pages rendered at `/policies/<slug>`. |
| `media` | Uploads (S3 or local disk). |

Plus one **global** (a single record, not a list): `homepage`, which holds all editorial homepage content — hero teams, banners, category rows, Watch & Buy cards, Children's Corner.

Access control convention: catalog collections (`products`, `categories`, `pages`, `media`, `homepage`) are world-readable; anything with personal data (`customers`, `orders`) is restricted to admins or the owning customer. Order creation is locked to server-side code — the public REST API cannot forge orders.

## `src/app/(storefront)/` — the shop

Server-rendered pages. Each page fetches its data through functions in `src/lib/` and passes plain typed objects down to components.

| Route | Page |
| --- | --- |
| `/` | Homepage, assembled from CMS-driven sections. |
| `/category/[slug]` | Category listing with the filter panel. |
| `/all`, `/new-in` | Full catalog and newest products. |
| `/product/[slug]` | Product detail: gallery, sizes, jersey name & number, add to cart. |
| `/search` | Search results. |
| `/checkout/address`, `/checkout/payment` | Checkout steps. (Payment gateway integration is currently stubbed.) |
| `/account` | Customer account. |
| `/track-order` | Order tracking. |
| `/policies/[slug]` | CMS rich-text pages (privacy, terms, …). |

The shared layout (`src/app/(storefront)/layout.tsx`) wraps every page in the three client-side providers (auth, bookmarks, cart) and renders the navbar, footer, and the slide-in cart.

## `src/app/(payload)/` — admin & API

- `admin/[[...segments]]` — the Payload admin panel UI at `/admin`.
- `api/[...slug]` — Payload's generated REST API for all collections (used by the admin panel and by the browser for things like customer login/logout/me).
- `api/graphql` — GraphQL endpoint (+ playground).
- `api/auth/*` — **custom** auth routes: `register`, `login`, `verify-email`, `resend-verification`, `request-password-reset`, `reset-password`. These exist so email verification is enforced server-side and can't be bypassed by calling Payload's public REST endpoint directly.
- `api/woocommerce/webhook` — receives order/customer events from the legacy store. Verifies the HMAC signature, deduplicates by delivery ID, logs to `webhook-events`, then upserts via the sync layer.

## `src/lib/` — data access & business logic

If you're looking for "the services layer", this is it.

| File / folder | Responsibility |
| --- | --- |
| `products.ts` | The frontend's domain types (`Product`, `Category`, `ImageFit`, `Seo`) plus static fallback data (nav links, IPL team logos). |
| `catalog.ts` | Fetches categories/products from Payload (Local API) and maps CMS documents to the frontend types. |
| `homepage.ts` | Same, for the homepage global (hero, banners, sections). |
| `pages.ts` | Same, for policy pages. |
| `seo.ts` | `buildMetadata()` — every public page builds its metadata through this so titles, canonicals, and social tags stay consistent. CMS overrides win; sensible defaults otherwise. |
| `bookmarks.ts` | Bookmark/wishlist helpers. |
| `auth/` | Email verification and password reset: code generation, hashing, expiry, email templates. |
| `email/resendAdapter.ts` | Payload email adapter backed by Resend. |
| `woocommerce/` | Legacy-store bridge: REST `client.ts` (with retry), `signature.ts` (webhook HMAC verification), `sync.ts` (upsert-by-WooCommerce-ID logic shared by the CLI scripts and the webhook), `types.ts`. |

**The key pattern:** server components never `fetch()` their own API. They call these lib functions, which use Payload's Local API — no HTTP round-trip, full type safety via `payload-types.ts`. If you're building a new page, follow this pattern.

## `src/components/` — UI

Grouped by area rather than by component type:

| Folder | Contents |
| --- | --- |
| `sections/` | Homepage sections (Hero, LatestDrops, WatchAndBuy, banners, ChildrensCorner, …). |
| `category/` | Category page pieces, including the FilterPanel. Its filter option lists must stay in sync with the facet select options in `payload.config.ts`. |
| `cart/` | `CartContext` (state, localStorage persistence, account sync), the cart overlay, and the multi-step checkout flow. |
| `auth/` | `AuthContext` and login/register UI. |
| `providers/` | Other client-side providers (bookmarks). |
| `layout/` | Navbar, mega menu, footer, bottom banner. |
| `ui/` | Small reusable primitives. |
| `admin/` | Custom field components for the **admin panel** — drag/zoom image-fit editors, colour picker, table cells. Frontend React code, but it ships in the CMS, not the storefront. |

A convention worth knowing: **image fits**. Admins position images inside their tiles with drag/zoom editors; the values (`scale`, `x`, `y`) are stored on the document and replayed on the storefront as a CSS transform via `fitTransform()` in `products.ts`. This is why product cards, menu tiles, and gallery images always match what the admin previewed.

## `src/migrations/` and `scripts/`

- `src/migrations/` — versioned Postgres migrations. The database adapter has `push: false`, so schema changes **only** happen through migrations: change `payload.config.ts` → `npm run payload:migrate:create` → `npm run payload:migrate` → `npm run generate:types`.
- `scripts/` — standalone CLI entry points for the WooCommerce migration (`migrate-woocommerce.ts`, per-entity sync scripts, `repair`, `verify`, tests). They're bundled with esbuild and run with Node reading `.env` directly — see [WOOCOMMERCE.md](WOOCOMMERCE.md) for usage. The actual sync logic lives in `src/lib/woocommerce/sync.ts` so scripts and the webhook share one implementation.

## Where conventional names map to

If you're used to a `context/` / `services/` / `types/` / `styles/` layout, here's the translation:

| Conventional name | In this repo |
| --- | --- |
| `context/` | `src/components/cart/CartContext.tsx`, `src/components/auth/AuthContext.tsx`, `src/components/providers/` |
| `services/` | `src/lib/` |
| `types/` | Generated CMS types in `payload-types.ts`; frontend domain types in `src/lib/products.ts` |
| `styles/` | `src/app/globals.css` + Tailwind utility classes in components |
