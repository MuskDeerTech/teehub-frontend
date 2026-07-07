# Setup Guide

This guide takes you from a fresh clone to a running app. TeeHub is a single Next.js application with Payload CMS embedded, so there is only one thing to install and one server to run — the storefront, the admin panel, and the API all come up together.

## Prerequisites

- **Node.js 20+** and npm
- **PostgreSQL** — a local install or a hosted database. You need a connection string.
- Optional, depending on what you're working on:
  - **Resend account** — for verification/password-reset emails. Without it, emails are simply not sent (registration flows that depend on codes won't complete).
  - **S3-compatible bucket** — for media uploads. Without it, uploads are stored on local disk, which is fine for development.

## 1. Install dependencies

```bash
npm install
```

## 2. Environment variables

Create a `.env` file in the project root. Next.js and all the npm scripts read from it automatically.

### Required

| Variable | What it is |
| --- | --- |
| `DATABASE_URI` | PostgreSQL connection string, e.g. `postgresql://user:pass@localhost:5432/teehub` |
| `PAYLOAD_SECRET` | Long random string used to sign auth tokens. Generate one with `openssl rand -hex 32`. Never reuse between environments. |

### Site URL

| Variable | What it is |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public origin used for canonical URLs, sitemaps, and SEO previews. Defaults to `https://teehubshop.com`, so you only need to set this if the domain changes or you're on a temporary host. |

### Email (Resend)

| Variable | What it is |
| --- | --- |
| `RESEND_API_KEY` | Resend API key. If unset, the email adapter is disabled entirely. |
| `RESEND_FROM_EMAIL` | From address. Defaults to `no-reply@teehubshop.com`. |
| `RESEND_FROM_NAME` | From name. Defaults to `TeeHub`. |
| `EMAIL_LOGO_URL` | Optional logo URL used in email templates. |

### Media storage (S3)

If `S3_BUCKET` is unset, uploads go to local disk — no other S3 variables are needed in dev.

| Variable | What it is |
| --- | --- |
| `S3_BUCKET` | Bucket name. Setting this switches media storage to S3. |
| `S3_ENDPOINT` | Endpoint URL (works with any S3-compatible provider). |
| `S3_REGION` | Bucket region. |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Credentials. |

### WooCommerce (legacy store)

The `WOOCOMMERCE_*` variables are only needed for the one-time data migration and the live sync webhook — not for normal development. They're documented in [WOOCOMMERCE.md](WOOCOMMERCE.md). Note that `WOOCOMMERCE_WEBHOOK_SECRET` is still required in production for as long as the live sync runs.

### Other

| Variable | What it is |
| --- | --- |
| `DATABASE_POOL_MAX` | Max Postgres connections for the app's pool. Defaults to `2` (suits small hosts / serverless). |
| `DISABLE_LOGGING` | Set to reduce log noise in scripts. |

## 3. Set up the database

The project uses versioned Payload migrations (`src/migrations/`) rather than auto-pushing schema changes. Run them against your database:

```bash
npm run payload:migrate
```

If you change collections in `payload.config.ts` later, create a new migration and regenerate the TypeScript types:

```bash
npm run payload:migrate:create   # writes a new migration to src/migrations/
npm run payload:migrate          # applies it
npm run generate:types           # refreshes payload-types.ts
```

## 4. Run the app

```bash
npm run dev
```

- Storefront: [http://localhost:3000](http://localhost:3000)
- Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

The first time you open `/admin` on an empty database, Payload prompts you to create the first admin user.

For a production build:

```bash
npm run build
npm run start
```

## Troubleshooting

- **Admin panel loads but images 404 in production** — check the S3 variables; without `S3_BUCKET` files are written to the server's local disk, which usually isn't persistent on hosted platforms.
- **Schema errors on startup** — you likely have pending migrations. Run `npm run payload:migrate`.
