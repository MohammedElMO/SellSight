-- V32__hnsw_tuning.sql
-- Rebuild the HNSW embedding index with proper build parameters for 500k vectors.
--
-- Why:
--   V21 used SET maintenance_work_mem = '12GB' outside any transaction scope.
--   That SET has no cross-connection effect in Flyway — each migration runs in its
--   own connection, so the index was built with the default 64 MB maintenance_work_mem,
--   severely limiting HNSW graph quality (effective m and ef_construction are reduced).
--
--   With m=16 and ef_construction=128, the HNSW graph provides recall >95% on 500k
--   vectors while keeping build time manageable at 1-2 GB RAM.
--
-- Runtime estimate: 5-15 minutes on 500k vectors at 384 dimensions.
-- The index build is non-blocking for reads (CREATE INDEX does not hold an exclusive lock
-- on the table for the full duration in pg >= 14 when run with CONCURRENTLY, but Flyway
-- migrations run in a transaction which conflicts with CONCURRENTLY — we use the plain
-- form and accept a brief exclusive lock. Run during a maintenance window if needed).

SET LOCAL maintenance_work_mem = '256MB';
SET LOCAL max_parallel_maintenance_workers = 0;

DROP INDEX IF EXISTS product_embedding_idx;

CREATE INDEX product_embedding_idx
    ON products
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 128);

-- Partial index for active products with embeddings — used by the two-phase hybrid query
-- to quickly locate candidate rows without filtering at HNSW scan time.
CREATE INDEX IF NOT EXISTS idx_products_active_has_embedding
    ON products (id)
    WHERE active = true AND embedding IS NOT NULL;

-- Refresh planner statistics so the new indexes are picked up immediately.
ANALYZE products;
