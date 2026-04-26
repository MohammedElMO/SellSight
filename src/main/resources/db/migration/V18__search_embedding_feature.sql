-- Re-create or Alter your table

ALTER TABLE products
ALTER COLUMN embedding TYPE vector(384);

-- Re-create the index for the new dimension
DROP INDEX IF EXISTS product_embedding_idx;
CREATE INDEX product_embedding_idx ON products
USING hnsw (embedding vector_cosine_ops);