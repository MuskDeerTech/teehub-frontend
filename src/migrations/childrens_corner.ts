import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "homepage"
      ADD COLUMN IF NOT EXISTS "childrens_corner_title" varchar DEFAULT 'Children''s Corner',
      ADD COLUMN IF NOT EXISTS "childrens_corner_href" varchar DEFAULT '/all/';

    CREATE TABLE IF NOT EXISTS "homepage_childrens_corner_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "category_id" integer,
      "card_image_id" integer,
      "logo_image_id" integer,
      "tab_color" varchar DEFAULT '#295DBE',
      "is_active" boolean DEFAULT true
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'homepage_childrens_corner_items_category_id_categories_id_fk'
      ) THEN
        ALTER TABLE "homepage_childrens_corner_items"
          ADD CONSTRAINT "homepage_childrens_corner_items_category_id_categories_id_fk"
          FOREIGN KEY ("category_id")
          REFERENCES "public"."categories"("id")
          ON DELETE set null
          ON UPDATE no action;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'homepage_childrens_corner_items_card_image_id_media_id_fk'
      ) THEN
        ALTER TABLE "homepage_childrens_corner_items"
          ADD CONSTRAINT "homepage_childrens_corner_items_card_image_id_media_id_fk"
          FOREIGN KEY ("card_image_id")
          REFERENCES "public"."media"("id")
          ON DELETE set null
          ON UPDATE no action;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'homepage_childrens_corner_items_logo_image_id_media_id_fk'
      ) THEN
        ALTER TABLE "homepage_childrens_corner_items"
          ADD CONSTRAINT "homepage_childrens_corner_items_logo_image_id_media_id_fk"
          FOREIGN KEY ("logo_image_id")
          REFERENCES "public"."media"("id")
          ON DELETE set null
          ON UPDATE no action;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'homepage_childrens_corner_items_parent_id_fk'
      ) THEN
        ALTER TABLE "homepage_childrens_corner_items"
          ADD CONSTRAINT "homepage_childrens_corner_items_parent_id_fk"
          FOREIGN KEY ("_parent_id")
          REFERENCES "public"."homepage"("id")
          ON DELETE cascade
          ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "homepage_childrens_corner_items_order_idx"
      ON "homepage_childrens_corner_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "homepage_childrens_corner_items_parent_id_idx"
      ON "homepage_childrens_corner_items" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "homepage_childrens_corner_items_category_idx"
      ON "homepage_childrens_corner_items" USING btree ("category_id");
    CREATE INDEX IF NOT EXISTS "homepage_childrens_corner_items_card_image_idx"
      ON "homepage_childrens_corner_items" USING btree ("card_image_id");
    CREATE INDEX IF NOT EXISTS "homepage_childrens_corner_items_logo_image_idx"
      ON "homepage_childrens_corner_items" USING btree ("logo_image_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "homepage_childrens_corner_items" CASCADE;
    ALTER TABLE "homepage"
      DROP COLUMN IF EXISTS "childrens_corner_title",
      DROP COLUMN IF EXISTS "childrens_corner_href";
  `);
}
