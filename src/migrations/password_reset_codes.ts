import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "customers"
      ADD COLUMN IF NOT EXISTS "password_reset_code_hash" varchar,
      ADD COLUMN IF NOT EXISTS "password_reset_expires_at" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "password_reset_attempts" numeric DEFAULT 0;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "customers"
      DROP COLUMN IF EXISTS "password_reset_code_hash",
      DROP COLUMN IF EXISTS "password_reset_expires_at",
      DROP COLUMN IF EXISTS "password_reset_attempts";
  `);
}
