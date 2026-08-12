import * as migration_password_reset_codes from './password_reset_codes';
import * as migration_watch_and_buy_items from './watch_and_buy_items';
import * as migration_seo_meta_fields from './seo_meta_fields';
import * as migration_childrens_corner from './childrens_corner';
import * as migration_search_global from './search_global';
import * as migration_top_collections from './top_collections';
import * as migration_product_page_and_reviews from './product_page_and_reviews';
import * as migration_order_exchange_and_variant_details from './order_exchange_and_variant_details';
import * as migration_hdfc_smartgateway from './hdfc_smartgateway';
import * as migration_hero_headlines from './hero_headlines';

// Order matters: Payload runs anything not yet recorded in `payload_migrations`
// top to bottom, so new migrations are appended rather than sorted in.
export const migrations = [
  {
    up: migration_password_reset_codes.up,
    down: migration_password_reset_codes.down,
    name: 'password_reset_codes'
  },
  {
    up: migration_watch_and_buy_items.up,
    down: migration_watch_and_buy_items.down,
    name: 'watch_and_buy_items'
  },
  {
    up: migration_seo_meta_fields.up,
    down: migration_seo_meta_fields.down,
    name: 'seo_meta_fields'
  },
  {
    up: migration_childrens_corner.up,
    down: migration_childrens_corner.down,
    name: 'childrens_corner'
  },
  {
    up: migration_search_global.up,
    down: migration_search_global.down,
    name: 'search_global'
  },
  {
    up: migration_top_collections.up,
    down: migration_top_collections.down,
    name: 'top_collections'
  },
  {
    up: migration_product_page_and_reviews.up,
    down: migration_product_page_and_reviews.down,
    name: 'product_page_and_reviews'
  },
  {
    up: migration_order_exchange_and_variant_details.up,
    down: migration_order_exchange_and_variant_details.down,
    name: 'order_exchange_and_variant_details'
  },
  {
    up: migration_hdfc_smartgateway.up,
    down: migration_hdfc_smartgateway.down,
    name: 'hdfc_smartgateway'
  },
  {
    up: migration_hero_headlines.up,
    down: migration_hero_headlines.down,
    name: 'hero_headlines'
  },
];
