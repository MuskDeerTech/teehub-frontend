# TeeHub

TeeHub is an e-commerce store for sports apparel — IPL jerseys, football hoodies, polos, jackets, and caps. It replaces the original WordPress/WooCommerce site at [teehubshop.com](https://teehubshop.com) with a modern, self-hosted stack.

The whole project lives in a single Next.js application. The customer-facing storefront and the content management system (Payload CMS) run side by side in the same app, share the same database, and deploy together. There is no separate backend repository.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org/) (App Router) with React 19 |
| Language | TypeScript |
| CMS / Backend | [Payload CMS 3](https://payloadcms.com/), embedded in the Next.js app |
| Database | PostgreSQL (via Payload's Drizzle adapter) |
| Styling | Tailwind CSS 4 |
| Media storage | S3-compatible object storage (falls back to local disk in dev) |
| Email | [Resend](https://resend.com/) for verification and transactional emails |
| Legacy bridge | WooCommerce REST API (one-time migration + live webhook sync) |

## Main Features

**Storefront**

- Homepage with CMS-editable sections: hero with IPL team switcher, Latest Drops, Watch & Buy video cards, promo banners, category product rows, and a Children's Corner.
- Category pages with a filter panel (theme, garment type, colour, sleeve, fit), product detail pages with image galleries, size selection, and an optional jersey name & number input.
- Search, "New In", policies pages, and order tracking.
- Slide-in cart with a multi-step checkout flow (details → login/register → payment). Cart persists in localStorage and syncs to the customer's account for cross-device checkout.

**Customer accounts**

- Email + password registration with email verification codes, password reset, and saved delivery addresses. Auth is powered by Payload with custom API routes so verification can't be bypassed.

**Admin (Payload CMS at `/admin`)**

- Manage products, categories, orders, customers, policy pages, media, and the homepage content — no code changes needed for day-to-day content edits.
- Custom admin tools: drag-and-zoom image fit editors (so images sit exactly right in their tiles), colour pickers, and per-collection SEO tabs with live Google/social previews.

**WooCommerce migration**

- CLI scripts migrate products, media, customers, and orders from the old store, and a signed webhook endpoint keeps orders and customers in sync while both systems run in parallel.

**SEO**

- Every public page builds consistent metadata (title, description, canonical, Open Graph, Twitter) with CMS-editable overrides, plus a generated sitemap, robots.txt, and web manifest.

## Documentation

| Document | What it covers |
| --- | --- |
| [docs/SETUP.md](docs/SETUP.md) | Installing, configuring environment variables, running the app and scripts |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Where code lives and how the app is organized |
| [docs/WOOCOMMERCE.md](docs/WOOCOMMERCE.md) | Legacy-store migration and live sync (runbook / historical reference) |

## Quick Start

```bash
npm install
# create .env — see docs/SETUP.md for the required variables
npm run payload:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront and [http://localhost:3000/admin](http://localhost:3000/admin) for the CMS.
