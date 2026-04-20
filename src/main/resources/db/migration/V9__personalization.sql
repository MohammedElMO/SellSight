-- V9__personalization.sql
-- Personalization: user-level product recommendations and feature flags.

CREATE TABLE user_recommendations (
    id          UUID            NOT NULL DEFAULT gen_random_uuid(),
    user_id     VARCHAR(255)    NOT NULL,
    product_id  VARCHAR(255)    NOT NULL,
    score       NUMERIC(5, 4)   NOT NULL DEFAULT 0.0000,
    reason      VARCHAR(100)    NOT NULL DEFAULT 'POPULAR',
    created_at  TIMESTAMP(6)    NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_user_recommendations PRIMARY KEY (id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT uq_ur_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX idx_ur_user_score ON user_recommendations (user_id, score DESC);

CREATE TABLE feature_flags (
    key         VARCHAR(100)    NOT NULL,
    enabled     BOOLEAN         NOT NULL DEFAULT FALSE,
    description VARCHAR(500),
    CONSTRAINT pk_feature_flags PRIMARY KEY (key)
);

-- Seed initial flags
INSERT INTO feature_flags (key, enabled, description) VALUES
    ('loyalty_program', TRUE, 'Enable the loyalty points system'),
    ('stripe_payments', FALSE, 'Enable Stripe payment processing'),
    ('semantic_search', FALSE, 'Enable pgvector semantic search'),
    ('event_tracking', TRUE, 'Enable behavioral event tracking to Kafka'),
    ('email_verification_required', FALSE, 'Require email verification before checkout');
