import * as migration_20260630_170750_password_reset_codes from './password_reset_codes';

export const migrations = [
  {
    up: migration_20260630_170750_password_reset_codes.up,
    down: migration_20260630_170750_password_reset_codes.down,
    name: '20260630_170750_password_reset_codes'
  },
];
