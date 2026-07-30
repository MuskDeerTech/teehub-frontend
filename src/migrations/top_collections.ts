import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "homepage"
      ADD COLUMN IF NOT EXISTS "top_collections_title" varchar DEFAULT 'Top Collections',
      ADD COLUMN IF NOT EXISTS "top_collections_href" varchar DEFAULT '/all/';

    CREATE TABLE IF NOT EXISTS "homepage_top_collections_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "category_id" integer,
      "image_id" integer,
      "label_override" varchar,
      "is_active" boolean DEFAULT true
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'homepage_top_collections_items_category_id_categories_id_fk'
      ) THEN
        ALTER TABLE "homepage_top_collections_items"
          ADD CONSTRAINT "homepage_top_collections_items_category_id_categories_id_fk"
          FOREIGN KEY ("category_id")
          REFERENCES "public"."categories"("id")
          ON DELETE set null
          ON UPDATE no action;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'homepage_top_collections_items_image_id_media_id_fk'
      ) THEN
        ALTER TABLE "homepage_top_collections_items"
          ADD CONSTRAINT "homepage_top_collections_items_image_id_media_id_fk"
          FOREIGN KEY ("image_id")
          REFERENCES "public"."media"("id")
          ON DELETE set null
          ON UPDATE no action;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'homepage_top_collections_items_parent_id_fk'
      ) THEN
        ALTER TABLE "homepage_top_collections_items"
          ADD CONSTRAINT "homepage_top_collections_items_parent_id_fk"
          FOREIGN KEY ("_parent_id")
          REFERENCES "public"."homepage"("id")
          ON DELETE cascade
          ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "homepage_top_collections_items_order_idx"
      ON "homepage_top_collections_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "homepage_top_collections_items_parent_id_idx"
      ON "homepage_top_collections_items" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "homepage_top_collections_items_category_idx"
      ON "homepage_top_collections_items" USING btree ("category_id");
    CREATE INDEX IF NOT EXISTS "homepage_top_collections_items_image_idx"
      ON "homepage_top_collections_items" USING btree ("image_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "homepage_top_collections_items" CASCADE;
    ALTER TABLE "homepage"
      DROP COLUMN IF EXISTS "top_collections_title",
      DROP COLUMN IF EXISTS "top_collections_href";
  `);
}
