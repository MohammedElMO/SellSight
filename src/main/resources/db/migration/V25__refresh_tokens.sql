CREATE TABLE refresh_tokens (
    id                  UUID            NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             VARCHAR(255)    NOT NULL,
    token_hash          VARCHAR(64)     NOT NULL UNIQUE,
    token_family_id     UUID            NOT NULL,
    expires_at          TIMESTAMP(6)    NOT NULL,
    created_at          TIMESTAMP(6)    NOT NULL,
    last_used_at        TIMESTAMP(6),
    revoked_at          TIMESTAMP(6),
    replaced_by_id      UUID,
    device_info         VARCHAR(512),
    ip_address          VARCHAR(45),
    user_agent          TEXT,
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_rt_user_id     ON refresh_tokens(user_id);
CREATE INDEX idx_rt_token_hash  ON refresh_tokens(token_hash);
CREATE INDEX idx_rt_family_id   ON refresh_tokens(token_family_id);
