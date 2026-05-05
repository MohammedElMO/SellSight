-- TOTP-based 2FA for ADMIN accounts
ALTER TABLE users ADD COLUMN totp_secret      VARCHAR(64);
ALTER TABLE users ADD COLUMN totp_enabled     BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN totp_backup_codes TEXT;
