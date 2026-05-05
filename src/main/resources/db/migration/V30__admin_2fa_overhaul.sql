-- Admin 2FA state machine fields + SUPER_ADMIN support
ALTER TABLE users ADD COLUMN admin_2fa_setup_required  BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN admin_2fa_setup_approved  BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN admin_2fa_reset_required  BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN failed_2fa_attempts       INT     NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN last_2fa_verified_at      TIMESTAMP;
