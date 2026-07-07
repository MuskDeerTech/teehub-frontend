# WooCommerce Migration & Sync

TeeHub replaced a WordPress/WooCommerce store. This document covers the bridge between the two systems: the one-time data migration and the live webhook sync that runs while both stores operate in parallel.

**Do you need this?** Only if you're running the migration scripts, operating the webhook sync, or debugging legacy data. Day-to-day development doesn't touch any of this — see [SETUP.md](SETUP.md) for normal setup. Once the old store is fully retired, this document is historical reference.

## How the bridge works

- **One-time migration** — CLI scripts in `scripts/` pull products, media, customers, and orders from the WooCommerce REST API and upsert them into Payload. Every imported record stores its `woocommerceId`, so re-running a script updates existing records instead of duplicating them.
- **Live sync** — while both stores run, a WooCommerce webhook posts order/customer events to `/api/woocommerce/webhook`. The endpoint verifies the HMAC signature, deduplicates by delivery ID, logs each delivery to the `webhook-events` collection (visible in the admin panel), and upserts through the same sync logic the scripts use (`src/lib/woocommerce/sync.ts`).

## Environment variables

Set these in `.env` (the scripts read it via `node --env-file`, so they must be in the file — shell exports alone won't reach them).

| Variable | What it is |
| --- | --- |
| `WOOCOMMERCE_URL` | Base URL of the WordPress site, e.g. `https://teehubshop.com` |
| `WOOCOMMERCE_CONSUMER_KEY` / `WOOCOMMERCE_CONSUMER_SECRET` | WooCommerce REST API keys (read access is enough for migration). |
| `WOOCOMMERCE_WEBHOOK_SECRET` | Shared secret used to verify webhook signatures. Must match the secret configured on the WooCommerce webhook. Required in production while the live sync runs. |
| `WOOCOMMERCE_SYNC_AFTER` | Optional ISO date — only sync records modified after this date. |
| `WOOCOMMERCE_PRODUCT_CONCURRENCY`, `WOOCOMMERCE_ORDER_CONCURRENCY`, `WOOCOMMERCE_CUSTOMER_CONCURRENCY`, `WOOCOMMERCE_MEDIA_CONCURRENCY` | Optional tuning for how many records/downloads are processed in parallel. |

## Migration scripts

All scripts are idempotent — safe to re-run.

```bash
npm run migrate:woocommerce          # full migration: media, products, customers, orders
npm run migrate:woocommerce:dry      # dry run — reports what would change, writes nothing
npm run migrate:woocommerce:restart  # ignore saved progress and start over

npm run sync:woocommerce:products    # products only
npm run sync:woocommerce:customers   # customers only
npm run sync:woocommerce:orders     # orders only

npm run repair:woocommerce           # fix up records from earlier partial runs
npm run verify:woocommerce           # compare Payload against WooCommerce and report drift
npm run test:woocommerce             # unit tests for the sync logic
```

A sensible first run is `migrate:woocommerce:dry` to see the scope, then the real migration, then `verify:woocommerce` to confirm nothing drifted.

Notes on imported data:

- Imported customer accounts get a random password and are flagged `requiresPasswordReset` — they must reset before their first sign-in.
- Orders keep a full WooCommerce snapshot in a hidden `woocommerceData` field for auditing.

## Webhook setup (live sync)

1. In WooCommerce admin, create webhooks for order and customer events pointing at `https://<your-domain>/api/woocommerce/webhook`.
2. Set the webhook secret to the same value as `WOOCOMMERCE_WEBHOOK_SECRET`.
3. Deliveries appear in the **Webhook Events** collection in the Payload admin with a status (`processed`, `failed`, `ignored`) and any error message — that's the first place to look when sync seems off.

## Troubleshooting

- **"Missing WOOCOMMERCE_URL…" when running a script** — the three core variables must be set in `.env` (the scripts don't read shell-only exports).
- **Webhook returns 401** — signature mismatch; the secret in WooCommerce and `WOOCOMMERCE_WEBHOOK_SECRET` differ.
- **Webhook returns 503** — `WOOCOMMERCE_WEBHOOK_SECRET` isn't set on the server.
- **Records look wrong after a partial run** — run `npm run repair:woocommerce`, then `npm run verify:woocommerce` to confirm.
