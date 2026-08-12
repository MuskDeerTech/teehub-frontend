import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

/**
 * Per-slide hero copy. The redesigned hero puts a headline over the artwork,
 * and it's the only part of that left-hand block that differs between teams —
 * the GEAR UP label, the four trust badges and the SHOP NOW button are
 * identical on every slide, so they stay in the component rather than being
 * re-entered per team.
 *
 * `theme` covers the one other thing that varies: bright artwork (the GT sky)
 * needs black copy instead of white. A two-option select rather than a colour
 * field, because one choice drives both the headline and the badge labels and
 * a free-form colour could be made unreadable.
 *
 * Hand-written for the same reason as the other migrations here: the base
 * schema predates migration tracking, so `payload migrate:create` has nothing
 * to diff against and would emit the whole schema. Column names, types and
 * enum naming match what Drizzle expects from the field config.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_homepage_hero_teams_theme"
        AS ENUM('dark', 'light');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    ALTER TABLE "homepage_hero_teams"
      ADD COLUMN IF NOT EXISTS "headline_top" varchar,
      ADD COLUMN IF NOT EXISTS "headline_bottom" varchar,
      ADD COLUMN IF NOT EXISTS "theme" "enum_homepage_hero_teams_theme" DEFAULT 'dark';
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "homepage_hero_teams"
      DROP COLUMN IF EXISTS "headline_top",
      DROP COLUMN IF EXISTS "headline_bottom",
      DROP COLUMN IF EXISTS "theme";

    DROP TYPE IF EXISTS "public"."enum_homepage_hero_teams_theme";
  `);
}
