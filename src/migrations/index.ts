import * as migration_password_reset_codes from './password_reset_codes';
import * as migration_watch_and_buy_items from './watch_and_buy_items';
import * as migration_seo_meta_fields from './seo_meta_fields';

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
];
