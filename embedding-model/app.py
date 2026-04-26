import os
os.environ["TRANSFORMERS_NO_TF"] = "1"
os.environ["USE_TF"] = "0"
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from embedding_engine import DEFAULT_MODEL_NAME, EmbeddingEngine


load_dotenv()


logger = logging.getLogger("embedding-api")
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))


def _create_engine() -> EmbeddingEngine:
    model_name = os.getenv("MODEL_NAME", DEFAULT_MODEL_NAME)
    provider = os.getenv("EMBEDDING_PROVIDER")
    max_text_chars = int(os.getenv("MAX_TEXT_CHARS", "300"))
    max_token_length = int(os.getenv("MAX_TOKEN_LENGTH", "128"))
    engine = EmbeddingEngine(
        model_name=model_name,
        provider=provider,
        max_text_chars=max_text_chars,
        max_token_length=max_token_length,
    )
    logger.info(
        "Embedding model loaded model=%s provider=%s dimension=%s",
        engine.model_name,
        engine.provider,
        engine.dimension,
    )
    return engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.engine = _create_engine()
    yield


app = FastAPI(
    title="SellSight Embedding Service",
    version="1.0.0",
    lifespan=lifespan,
)


class EmbedRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=4096)


class EmbedResponse(BaseModel):
    embedding: list[float]


class BatchEmbedRequest(BaseModel):
    texts: list[str] = Field(..., min_length=1, max_length=256)


class BatchEmbedResponse(BaseModel):
    embeddings: list[list[float]]


def get_engine() -> EmbeddingEngine:
    engine = getattr(app.state, "engine", None)
    if engine is None:
        raise HTTPException(status_code=503, detail="Embedding engine is not initialized")
    return engine


@app.get("/health")
def health() -> dict[str, object]:
    engine = get_engine()
    return {
        "status": "ok",
        "model": engine.model_name,
        "provider": engine.provider,
        "dimension": engine.dimension,
    }


@app.post("/embed", response_model=EmbedResponse)
def embed(request: EmbedRequest) -> EmbedResponse:
    engine = get_engine()
    text = engine.prepare_text(request.text)
    if not text:
        raise HTTPException(status_code=422, detail="text cannot be blank")
    vector = engine.embed_one(text)
    return EmbedResponse(embedding=[float(x) for x in vector.tolist()])


@app.post("/embed/batch", response_model=BatchEmbedResponse)
def embed_batch(request: BatchEmbedRequest) -> BatchEmbedResponse:
    engine = get_engine()
    texts = [engine.prepare_text(text) for text in request.texts]
    if any(not text for text in texts):
        raise HTTPException(status_code=422, detail="all texts must be non-empty")
    vectors = engine.embed(texts)
    return BatchEmbedResponse(embeddings=[[float(x) for x in row.tolist()] for row in vectors])
