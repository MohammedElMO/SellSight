-- V31: Force-password-change flag for bootstrap + expand totp_secret for AES-256-GCM

-- Bootstrap flag: SUPER_ADMIN must change temp password before 2FA setup
ALTER TABLE users ADD COLUMN force_password_change BOOLEAN NOT NULL DEFAULT FALSE;

-- Expand column to hold AES-256-GCM encrypted secret (IV+ciphertext+tag → base64 ≈ 112 chars)
ALTER TABLE users ALTER COLUMN totp_secret TYPE VARCHAR(256);

-- Clear all existing unencrypted TOTP secrets — admins must re-setup with encryption
UPDATE users
SET totp_secret      = NULL,
    totp_enabled     = FALSE,
    totp_backup_codes = NULL
WHERE totp_secret IS NOT NULL;

-- Ensure all admins who lost their secret are flagged for re-setup
UPDATE users
SET admin_2fa_setup_required = TRUE,
    admin_2fa_setup_approved  = TRUE
WHERE role IN ('ADMIN', 'SUPER_ADMIN')
  AND totp_enabled = FALSE
  AND totp_secret IS NULL;

-- Mark existing SUPER_ADMINs who haven't completed 2FA as needing password change
-- (handles already-seeded accounts that predate V31)
UPDATE users
SET force_password_change = TRUE
WHERE role = 'SUPER_ADMIN'
  AND totp_enabled = FALSE;
