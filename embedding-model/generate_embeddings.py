import os
import time

import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import execute_values
from tqdm import tqdm

from embedding_engine import DEFAULT_MODEL_NAME, EmbeddingEngine, build_product_text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "256"))
MODEL_NAME = os.getenv("MODEL_NAME", DEFAULT_MODEL_NAME)
EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER")
MAX_TEXT_CHARS = int(os.getenv("MAX_TEXT_CHARS", "300"))

TABLE_NAME = "products"
ID_COL = "id"
NAME_COL = "name"
DESCRIPTION_COL = "description"
CATEGORY_COL = "category"


def vector_to_pg(vector):
    return "[" + ",".join(f"{float(x):.6f}" for x in vector) + "]"


def main():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL missing")

    print("Loading embedding engine...")
    engine = EmbeddingEngine(
        model_name=MODEL_NAME,
        provider=EMBEDDING_PROVIDER,
        max_text_chars=MAX_TEXT_CHARS,
    )
    print(f"Provider: {engine.provider} | Dimension: {engine.dimension}")

    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False

    with conn.cursor() as cur:
        cur.execute(f"SELECT COUNT(*) FROM {TABLE_NAME} WHERE embedding IS NULL;")
        total = cur.fetchone()[0]

    print("Rows:", total)
    pbar = tqdm(total=total)
    start = time.time()

    while True:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                SELECT {ID_COL}, {NAME_COL}, {DESCRIPTION_COL}, {CATEGORY_COL}
                FROM {TABLE_NAME}
                WHERE embedding IS NULL
                ORDER BY {ID_COL}
                LIMIT %s
                """,
                (BATCH_SIZE,),
            )
            rows = cur.fetchall()

        if not rows:
            break

        ids = [row[0] for row in rows]
        texts = [
            build_product_text(
                name=row[1],
                description=row[2],
                category=row[3],
                max_text_chars=MAX_TEXT_CHARS,
            )
            for row in rows
        ]
        embeddings = engine.embed(texts)

        update_rows = [(ids[i], vector_to_pg(embeddings[i])) for i in range(len(ids))]

        with conn.cursor() as cur:
            execute_values(
                cur,
                f"""
                UPDATE {TABLE_NAME} p
                SET embedding = data.embedding::vector
                FROM (VALUES %s) AS data(id, embedding)
                WHERE p.{ID_COL} = data.id
                """,
                update_rows,
                template="(%s,%s)",
                page_size=BATCH_SIZE,
            )

        conn.commit()
        pbar.update(len(rows))

    pbar.close()
    conn.close()

    mins = (time.time() - start) / 60
    print(f"Done in {mins:.2f} min")


if __name__ == "__main__":
    main()
