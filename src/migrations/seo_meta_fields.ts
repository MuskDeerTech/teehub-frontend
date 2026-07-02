import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

/**
 * Adds the SEO plugin's `meta` group (meta title, meta description, canonical
 * URL) to every collection/global with a public page: products, categories,
 * pages, and the homepage global. All columns are nullable text — additive and
 * non-destructive, so existing rows are untouched and simply have empty SEO
 * fields (the storefront falls back to page-derived defaults).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "meta_title" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "meta_description" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "meta_canonical_u_r_l" varchar;

    ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "meta_title" varchar;
    ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "meta_description" varchar;
    ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "meta_canonical_u_r_l" varchar;

    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "meta_title" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "meta_description" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "meta_canonical_u_r_l" varchar;

    ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "meta_title" varchar;
    ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "meta_description" varchar;
    ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "meta_canonical_u_r_l" varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" DROP COLUMN IF EXISTS "meta_title";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "meta_description";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "meta_canonical_u_r_l";

    ALTER TABLE "categories" DROP COLUMN IF EXISTS "meta_title";
    ALTER TABLE "categories" DROP COLUMN IF EXISTS "meta_description";
    ALTER TABLE "categories" DROP COLUMN IF EXISTS "meta_canonical_u_r_l";

    ALTER TABLE "pages" DROP COLUMN IF EXISTS "meta_title";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "meta_description";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "meta_canonical_u_r_l";

    ALTER TABLE "homepage" DROP COLUMN IF EXISTS "meta_title";
    ALTER TABLE "homepage" DROP COLUMN IF EXISTS "meta_description";
    ALTER TABLE "homepage" DROP COLUMN IF EXISTS "meta_canonical_u_r_l";
  `);
}
