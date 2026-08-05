import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

/**
 * Product-page redesign: the `reviews` collection, the store-wide `product-page`
 * global (offer tiles, trust badges, delivery lead time), and the per-product
 * social-proof / prepaid / accordion fields.
 *
 * Written by hand rather than taken straight from `payload migrate:create`:
 * this project's base schema was created by `push` before migrations were
 * tracked, so the generator has no history to diff against and emits the entire
 * schema. The DDL below is lifted verbatim from that generated output — same
 * column names, types and index names Drizzle expects — but reduced to only the
 * new objects and made idempotent, matching the other migrations here.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_products_social_proof_icon"
        AS ENUM('fire', 'instagram', 'parcel', 'star');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_reviews_feature_tags"
        AS ENUM('Color', 'Comfort', 'Quality', 'Fit');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_product_page_trust_badges_icon"
        AS ENUM('return', 'delivery', 'cod', 'shield');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    -- ── Products: social proof, prepaid box, accordion overrides ─────────────
    ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "conversions_badge" varchar,
      ADD COLUMN IF NOT EXISTS "prepaid_price" numeric,
      ADD COLUMN IF NOT EXISTS "prepaid_note" varchar DEFAULT 'Use best price on prepaid Orders',
      ADD COLUMN IF NOT EXISTS "prepaid_badge" varchar,
      ADD COLUMN IF NOT EXISTS "wash_care" varchar,
      ADD COLUMN IF NOT EXISTS "shipping_info" varchar;

    CREATE TABLE IF NOT EXISTS "products_social_proof" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "icon" "enum_products_social_proof_icon" DEFAULT 'fire' NOT NULL,
      "text" varchar NOT NULL,
      "href" varchar
    );

    -- ── Reviews ─────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS "reviews" (
      "id" serial PRIMARY KEY NOT NULL,
      "product_id" integer NOT NULL,
      "customer_id" integer,
      "is_published" boolean DEFAULT false,
      "author_name" varchar NOT NULL,
      "is_verified_buyer" boolean DEFAULT false,
      "rating" numeric NOT NULL,
      "body" varchar NOT NULL,
      "size_bought" varchar,
      "purchased_at" timestamp(3) with time zone,
      "helpful_count" numeric DEFAULT 0,
      "not_helpful_count" numeric DEFAULT 0,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "reviews_feature_tags" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "value" "enum_reviews_feature_tags",
      "id" serial PRIMARY KEY NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "reviews_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "media_id" integer
    );

    -- ── Product Page global ─────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS "product_page" (
      "id" serial PRIMARY KEY NOT NULL,
      "offers_title" varchar DEFAULT 'Available Offers',
      "delivery_label" varchar DEFAULT 'FAST DELIVERY',
      "delivery_lead_days" numeric DEFAULT 7,
      "tax_note" varchar DEFAULT 'Inclusive of all taxes',
      "whatsapp_number" varchar,
      "wash_care" varchar,
      "shipping" varchar,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );

    CREATE TABLE IF NOT EXISTS "product_page_offers" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "amount_off" numeric NOT NULL,
      "min_spend" numeric NOT NULL,
      "is_active" boolean DEFAULT true
    );

    CREATE TABLE IF NOT EXISTS "product_page_trust_badges" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "icon" "enum_product_page_trust_badges_icon" DEFAULT 'return' NOT NULL,
      "title" varchar NOT NULL,
      "subtitle" varchar,
      "is_active" boolean DEFAULT true
    );

    -- Admin document locking tracks every collection, so it needs a column for
    -- the new one.
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "reviews_id" integer;

    -- ── Foreign keys ────────────────────────────────────────────────────────
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_social_proof_parent_id_fk') THEN
        ALTER TABLE "products_social_proof"
          ADD CONSTRAINT "products_social_proof_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_product_id_products_id_fk') THEN
        ALTER TABLE "reviews"
          ADD CONSTRAINT "reviews_product_id_products_id_fk"
          FOREIGN KEY ("product_id") REFERENCES "public"."products"("id")
          ON DELETE set null ON UPDATE no action;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_customer_id_customers_id_fk') THEN
        ALTER TABLE "reviews"
          ADD CONSTRAINT "reviews_customer_id_customers_id_fk"
          FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id")
          ON DELETE set null ON UPDATE no action;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_feature_tags_parent_fk') THEN
        ALTER TABLE "reviews_feature_tags"
          ADD CONSTRAINT "reviews_feature_tags_parent_fk"
          FOREIGN KEY ("parent_id") REFERENCES "public"."reviews"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_rels_parent_fk') THEN
        ALTER TABLE "reviews_rels"
          ADD CONSTRAINT "reviews_rels_parent_fk"
          FOREIGN KEY ("parent_id") REFERENCES "public"."reviews"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_rels_media_fk') THEN
        ALTER TABLE "reviews_rels"
          ADD CONSTRAINT "reviews_rels_media_fk"
          FOREIGN KEY ("media_id") REFERENCES "public"."media"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_page_offers_parent_id_fk') THEN
        ALTER TABLE "product_page_offers"
          ADD CONSTRAINT "product_page_offers_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."product_page"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_page_trust_badges_parent_id_fk') THEN
        ALTER TABLE "product_page_trust_badges"
          ADD CONSTRAINT "product_page_trust_badges_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."product_page"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_reviews_fk') THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk"
          FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    -- ── Indexes ─────────────────────────────────────────────────────────────
    CREATE INDEX IF NOT EXISTS "products_social_proof_order_idx" ON "products_social_proof" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "products_social_proof_parent_id_idx" ON "products_social_proof" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "reviews_product_idx" ON "reviews" USING btree ("product_id");
    CREATE INDEX IF NOT EXISTS "reviews_customer_idx" ON "reviews" USING btree ("customer_id");
    CREATE INDEX IF NOT EXISTS "reviews_is_published_idx" ON "reviews" USING btree ("is_published");
    CREATE INDEX IF NOT EXISTS "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "reviews_created_at_idx" ON "reviews" USING btree ("created_at");

    CREATE INDEX IF NOT EXISTS "reviews_feature_tags_order_idx" ON "reviews_feature_tags" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "reviews_feature_tags_parent_idx" ON "reviews_feature_tags" USING btree ("parent_id");

    CREATE INDEX IF NOT EXISTS "reviews_rels_order_idx" ON "reviews_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "reviews_rels_parent_idx" ON "reviews_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "reviews_rels_path_idx" ON "reviews_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "reviews_rels_media_id_idx" ON "reviews_rels" USING btree ("media_id");

    CREATE INDEX IF NOT EXISTS "product_page_offers_order_idx" ON "product_page_offers" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "product_page_offers_parent_id_idx" ON "product_page_offers" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "product_page_trust_badges_order_idx" ON "product_page_trust_badges" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "product_page_trust_badges_parent_id_idx" ON "product_page_trust_badges" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "reviews_id";

    DROP TABLE IF EXISTS "product_page_trust_badges" CASCADE;
    DROP TABLE IF EXISTS "product_page_offers" CASCADE;
    DROP TABLE IF EXISTS "product_page" CASCADE;

    DROP TABLE IF EXISTS "reviews_rels" CASCADE;
    DROP TABLE IF EXISTS "reviews_feature_tags" CASCADE;
    DROP TABLE IF EXISTS "reviews" CASCADE;

    DROP TABLE IF EXISTS "products_social_proof" CASCADE;

    ALTER TABLE "products"
      DROP COLUMN IF EXISTS "conversions_badge",
      DROP COLUMN IF EXISTS "prepaid_price",
      DROP COLUMN IF EXISTS "prepaid_note",
      DROP COLUMN IF EXISTS "prepaid_badge",
      DROP COLUMN IF EXISTS "wash_care",
      DROP COLUMN IF EXISTS "shipping_info";

    DROP TYPE IF EXISTS "public"."enum_product_page_trust_badges_icon";
    DROP TYPE IF EXISTS "public"."enum_reviews_feature_tags";
    DROP TYPE IF EXISTS "public"."enum_products_social_proof_icon";
  `);
}
