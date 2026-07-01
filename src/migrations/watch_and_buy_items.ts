import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "homepage_watch_and_buy_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "product_id" integer NOT NULL,
      "video_id" integer NOT NULL,
      "is_active" boolean DEFAULT true
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'homepage_watch_and_buy_items_product_id_products_id_fk'
      ) THEN
        ALTER TABLE "homepage_watch_and_buy_items"
          ADD CONSTRAINT "homepage_watch_and_buy_items_product_id_products_id_fk"
          FOREIGN KEY ("product_id")
          REFERENCES "public"."products"("id")
          ON DELETE set null
          ON UPDATE no action;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'homepage_watch_and_buy_items_video_id_media_id_fk'
      ) THEN
        ALTER TABLE "homepage_watch_and_buy_items"
          ADD CONSTRAINT "homepage_watch_and_buy_items_video_id_media_id_fk"
          FOREIGN KEY ("video_id")
          REFERENCES "public"."media"("id")
          ON DELETE set null
          ON UPDATE no action;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'homepage_watch_and_buy_items_parent_id_fk'
      ) THEN
        ALTER TABLE "homepage_watch_and_buy_items"
          ADD CONSTRAINT "homepage_watch_and_buy_items_parent_id_fk"
          FOREIGN KEY ("_parent_id")
          REFERENCES "public"."homepage"("id")
          ON DELETE cascade
          ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "homepage_watch_and_buy_items_order_idx"
      ON "homepage_watch_and_buy_items" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "homepage_watch_and_buy_items_parent_id_idx"
      ON "homepage_watch_and_buy_items" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "homepage_watch_and_buy_items_product_idx"
      ON "homepage_watch_and_buy_items" USING btree ("product_id");
    CREATE INDEX IF NOT EXISTS "homepage_watch_and_buy_items_video_idx"
      ON "homepage_watch_and_buy_items" USING btree ("video_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "homepage_watch_and_buy_items" CASCADE;
  `);
}
