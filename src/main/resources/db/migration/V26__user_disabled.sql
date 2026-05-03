-- Admin-initiated account suspension (distinct from user-initiated soft-delete).
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS disabled BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_disabled ON users (disabled) WHERE disabled = true;
