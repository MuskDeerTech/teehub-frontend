import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

/**
 * Everything the redesigned order history renders but had no column behind it:
 * the delivery date in the card header, the colour/fabric line under each item,
 * the per-item "Exchange" flag on the thumbnail, and the order-level exchange
 * strip (state + reason + reference) that also feeds the Return tab.
 *
 * Products gain `material` so order lines have something to snapshot from —
 * colour already exists there as the `colors` filter tag.
 *
 * Hand-written for the same reason as the other migrations here: the base
 * schema predates migration tracking, so `payload migrate:create` has nothing
 * to diff against and would emit the whole schema. Column names, types and
 * enum naming match what Drizzle expects from the field config.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_orders_exchange_state"
        AS ENUM('pending', 'accepted');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    -- ── Orders: delivery date + exchange record ─────────────────────────────
    ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "delivered_at" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "exchange_state" "enum_orders_exchange_state",
      ADD COLUMN IF NOT EXISTS "exchange_reason" varchar,
      ADD COLUMN IF NOT EXISTS "exchange_reference" varchar;

    -- ── Order lines: variant snapshot + which line was exchanged ────────────
    ALTER TABLE "orders_items"
      ADD COLUMN IF NOT EXISTS "color" varchar,
      ADD COLUMN IF NOT EXISTS "material" varchar,
      ADD COLUMN IF NOT EXISTS "exchanged" boolean DEFAULT false;

    -- ── Products: fabric, copied onto order lines at purchase time ──────────
    ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "material" varchar;

    -- The Return tab filters on exchange state, so it is worth an index.
    CREATE INDEX IF NOT EXISTS "orders_exchange_state_idx"
      ON "orders" USING btree ("exchange_state");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "orders_exchange_state_idx";

    ALTER TABLE "products"
      DROP COLUMN IF EXISTS "material";

    ALTER TABLE "orders_items"
      DROP COLUMN IF EXISTS "color",
      DROP COLUMN IF EXISTS "material",
      DROP COLUMN IF EXISTS "exchanged";

    ALTER TABLE "orders"
      DROP COLUMN IF EXISTS "delivered_at",
      DROP COLUMN IF EXISTS "exchange_state",
      DROP COLUMN IF EXISTS "exchange_reason",
      DROP COLUMN IF EXISTS "exchange_reference";

    DROP TYPE IF EXISTS "public"."enum_orders_exchange_state";
  `);
}
