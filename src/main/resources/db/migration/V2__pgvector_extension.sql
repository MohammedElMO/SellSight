-- V2__pgvector_extension.sql
-- Enables the pgvector extension for semantic search and similar-product
-- queries. The catalog session will add a VECTOR(384) column to `products`
-- (matching all-MiniLM-L6-v2) in a later migration; this one only prepares
-- the extension so that subsequent migrations can reference the `vector` type.

CREATE EXTENSION IF NOT EXISTS vector;
