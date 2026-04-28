import os
os.environ["TRANSFORMERS_NO_TF"] = "1"
os.environ["USE_TF"] = "0"
from typing import Iterable

import numpy as np
import torch
from sentence_transformers import SentenceTransformer


DEFAULT_MODEL_NAME = "sentence-transformers/multi-qa-MiniLM-L6-cos-v1"
DEFAULT_MAX_TEXT_CHARS = 300


def compact_whitespace(value: str | None) -> str:
    if value is None:
        return ""
    return " ".join(value.strip().split())


def build_product_text(
    name: str | None,
    description: str | None,
    category: str | None,
    max_text_chars: int = DEFAULT_MAX_TEXT_CHARS,
) -> str:
    parts = [compact_whitespace(name), compact_whitespace(category), compact_whitespace(description)]
    text = " ".join(part for part in parts if part)
    if max_text_chars > 0:
        return text[:max_text_chars]
    return text


def _resolve_device(preferred: str | None) -> str:
    if preferred:
        return preferred
    if torch.cuda.is_available():
        return "cuda"
    return "cpu"


class EmbeddingEngine:
    def __init__(
        self,
        model_name: str = DEFAULT_MODEL_NAME,
        provider: str | None = None,  # kept for API compat; maps to torch device
        max_text_chars: int = DEFAULT_MAX_TEXT_CHARS,
        max_token_length: int = 128,  # kept for API compat, unused
    ) -> None:
        self.model_name = model_name
        self.max_text_chars = max_text_chars
        self.provider = _resolve_device(provider)
        self._model = SentenceTransformer(model_name, device=self.provider)
        self.dimension = self._model.get_sentence_embedding_dimension()

    def prepare_text(self, text: str | None) -> str:
        prepared = compact_whitespace(text)
        if self.max_text_chars > 0:
            prepared = prepared[: self.max_text_chars]
        return prepared

    def embed(self, texts: Iterable[str]) -> np.ndarray:
        text_list = list(texts)
        if not text_list:
            raise ValueError("At least one text is required")
        return self._model.encode(
            text_list,
            normalize_embeddings=True,
            convert_to_numpy=True,
            show_progress_bar=False,
            batch_size=128,
        ).astype(np.float32)

    def embed_one(self, text: str) -> np.ndarray:
        return self.embed([text])[0]
