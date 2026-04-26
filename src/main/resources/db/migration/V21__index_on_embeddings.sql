
    SET maintenance_work_mem = '12GB';
    SET max_parallel_maintenance_workers = 6;


    CREATE INDEX IF NOT EXISTS product_embedding_idx
        ON products
            USING hnsw (embedding vector_cosine_ops);