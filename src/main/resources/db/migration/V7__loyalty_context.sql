-- V7__loyalty_context.sql
-- Loyalty bounded context: points accounts, transaction ledger, and referrals.

CREATE TABLE loyalty_accounts (
    user_id         VARCHAR(255)    NOT NULL,
    balance         INTEGER         NOT NULL DEFAULT 0,
    lifetime_spend  NUMERIC(12, 2)  NOT NULL DEFAULT 0.00,
    tier            VARCHAR(10)     NOT NULL DEFAULT 'BRONZE',
    referral_code   VARCHAR(20)     NOT NULL,
    created_at      TIMESTAMP(6)    NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_loyalty_accounts PRIMARY KEY (user_id),
    CONSTRAINT fk_la_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_la_referral_code UNIQUE (referral_code),
    CONSTRAINT chk_la_tier CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD')),
    CONSTRAINT chk_la_balance CHECK (balance >= 0)
);

CREATE TABLE loyalty_transactions (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    user_id         VARCHAR(255)    NOT NULL,
    type            VARCHAR(20)     NOT NULL,  -- EARN, REDEEM, BONUS, REFERRAL
    points          INTEGER         NOT NULL,
    description     VARCHAR(500)    NOT NULL,
    order_id        VARCHAR(36),
    created_at      TIMESTAMP(6)    NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_loyalty_transactions PRIMARY KEY (id),
    CONSTRAINT fk_lt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_lt_type CHECK (type IN ('EARN', 'REDEEM', 'BONUS', 'REFERRAL'))
);

CREATE INDEX idx_lt_user ON loyalty_transactions (user_id);
CREATE INDEX idx_lt_created ON loyalty_transactions (created_at DESC);

CREATE TABLE referrals (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    referrer_id     VARCHAR(255)    NOT NULL,
    referee_id      VARCHAR(255)    NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMP(6)    NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_referrals PRIMARY KEY (id),
    CONSTRAINT fk_ref_referrer FOREIGN KEY (referrer_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_ref_referee FOREIGN KEY (referee_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_referrals_referee UNIQUE (referee_id),
    CONSTRAINT chk_ref_status CHECK (status IN ('PENDING', 'COMPLETED', 'EXPIRED'))
);

CREATE INDEX idx_referrals_referrer ON referrals (referrer_id);
