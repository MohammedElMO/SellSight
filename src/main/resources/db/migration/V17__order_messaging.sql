-- V17__order_messaging.sql
-- Adds order-scoped messaging between customers and sellers.

CREATE TABLE order_messages (
    id          UUID            NOT NULL DEFAULT gen_random_uuid(),
    order_id    VARCHAR(36)     NOT NULL,
    sender_id   VARCHAR(255)    NOT NULL,
    sender_role VARCHAR(20)     NOT NULL,
    body        TEXT            NOT NULL,
    sent_at     TIMESTAMP(6)    NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_order_messages PRIMARY KEY (id),
    CONSTRAINT fk_om_order  FOREIGN KEY (order_id)  REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_om_sender FOREIGN KEY (sender_id) REFERENCES users  (id) ON DELETE CASCADE,
    CONSTRAINT chk_om_role  CHECK (sender_role IN ('CUSTOMER', 'SELLER', 'ADMIN'))
);

CREATE INDEX idx_order_messages_order ON order_messages (order_id, sent_at);
