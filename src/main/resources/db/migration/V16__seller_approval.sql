-- V16: Add seller_status column for seller approval workflow.
-- Existing sellers are automatically approved so their dashboards keep working.

ALTER TABLE users ADD COLUMN seller_status VARCHAR(20);

UPDATE users SET seller_status = 'APPROVED' WHERE role = 'SELLER';
