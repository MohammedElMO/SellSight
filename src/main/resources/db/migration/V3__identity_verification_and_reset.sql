-- V3__identity_verification_and_reset.sql
-- Adds email-verification flag, soft-delete timestamp, and token tables for
-- email-verification and password-reset flows.

ALTER TABLE users
    ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN deleted_at     TIMESTAMP(6);

-- OAuth accounts are considered verified by the provider.
UPDATE users SET email_verified = TRUE WHERE auth_provider <> 'LOCAL';

CREATE TABLE email_verification_tokens (
    token        UUID          NOT NULL,
    user_id      VARCHAR(255)  NOT NULL,
    expires_at   TIMESTAMP(6)  NOT NULL,
    used_at      TIMESTAMP(6),
    created_at   TIMESTAMP(6)  NOT NULL,
    CONSTRAINT pk_email_verification_tokens PRIMARY KEY (token),
    CONSTRAINT fk_evt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_evt_user ON email_verification_tokens (user_id);

CREATE TABLE password_reset_tokens (
    token        UUID          NOT NULL,
    user_id      VARCHAR(255)  NOT NULL,
    expires_at   TIMESTAMP(6)  NOT NULL,
    used_at      TIMESTAMP(6),
    created_at   TIMESTAMP(6)  NOT NULL,
    CONSTRAINT pk_password_reset_tokens PRIMARY KEY (token),
    CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_prt_user ON password_reset_tokens (user_id);
