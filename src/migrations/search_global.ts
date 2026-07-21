import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

/**
 * Adds the site-wide `search` global (admin-managed "Popular Searches" chips
 * in the search overlay). Table shapes match what Payload generates for a
 * global with a single array field.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "search" (
      "id" serial PRIMARY KEY NOT NULL,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );

    CREATE TABLE IF NOT EXISTS "search_popular_searches" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "term" varchar NOT NULL
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'search_popular_searches_parent_id_fk'
      ) THEN
        ALTER TABLE "search_popular_searches"
          ADD CONSTRAINT "search_popular_searches_parent_id_fk"
          FOREIGN KEY ("_parent_id")
          REFERENCES "public"."search"("id")
          ON DELETE cascade
          ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "search_popular_searches_order_idx"
      ON "search_popular_searches" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "search_popular_searches_parent_id_idx"
      ON "search_popular_searches" USING btree ("_parent_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "search_popular_searches" CASCADE;
    DROP TABLE IF EXISTS "search" CASCADE;
  `);
}
