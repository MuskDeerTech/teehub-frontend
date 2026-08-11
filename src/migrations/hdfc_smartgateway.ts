import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

/**
 * Server-verified HDFC SmartGateway identifiers and status. These live in the
 * existing `payment` group, whose fields are flattened onto the orders table.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "payment_gateway_order_id" varchar,
      ADD COLUMN IF NOT EXISTS "payment_gateway_status" varchar,
      ADD COLUMN IF NOT EXISTS "payment_verified_at" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "payment_gateway_response" jsonb;

    CREATE UNIQUE INDEX IF NOT EXISTS "orders_payment_gateway_order_id_idx"
      ON "orders" USING btree ("payment_gateway_order_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "orders_payment_gateway_order_id_idx";

    ALTER TABLE "orders"
      DROP COLUMN IF EXISTS "payment_gateway_order_id",
      DROP COLUMN IF EXISTS "payment_gateway_status",
      DROP COLUMN IF EXISTS "payment_verified_at",
      DROP COLUMN IF EXISTS "payment_gateway_response";
  `);
}
