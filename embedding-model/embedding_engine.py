import os
import os
os.environ["TRANSFORMERS_NO_TF"] = "1"
os.environ["USE_TF"] = "0"
from typing import Iterable

import numpy as np
import onnxruntime as ort
from optimum.onnxruntime.modeling_ort import ORTModelForFeatureExtraction
from transformers import AutoTokenizer


DEFAULT_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
DEFAULT_MAX_TEXT_CHARS = 300
DEFAULT_MAX_TOKEN_LENGTH = 128


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


class EmbeddingEngine:
    def __init__(
        self,
        model_name: str = DEFAULT_MODEL_NAME,
        provider: str | None = None,
        max_text_chars: int = DEFAULT_MAX_TEXT_CHARS,
        max_token_length: int = DEFAULT_MAX_TOKEN_LENGTH,
    ) -> None:
        self.model_name = model_name
        self.max_text_chars = max_text_chars
        self.max_token_length = max_token_length
        self.provider = self._resolve_provider(provider)
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = ORTModelForFeatureExtraction.from_pretrained(model_name, provider=self.provider)
        self.model.use_io_binding = False
        self.dimension = int(getattr(self.model.config, "hidden_size", 384))

    @staticmethod
    def _resolve_provider(preferred_provider: str | None) -> str:
        available = ort.get_available_providers()
        if preferred_provider and preferred_provider in available:
            return preferred_provider
        if "CUDAExecutionProvider" in available:
            return "CUDAExecutionProvider"
        if "CPUExecutionProvider" in available:
            return "CPUExecutionProvider"
        if not available:
            raise RuntimeError("No ONNX Runtime providers are available")
        return available[0]

    def prepare_text(self, text: str | None) -> str:
        prepared = compact_whitespace(text)
        if self.max_text_chars > 0:
            prepared = prepared[: self.max_text_chars]
        return prepared

    def embed(self, texts: Iterable[str]) -> np.ndarray:
        prepared_texts = [self.prepare_text(text) for text in texts]
        if not prepared_texts:
            raise ValueError("At least one text is required")
        encoded = self.tokenizer(
            prepared_texts,
            padding=True,
            truncation=True,
            max_length=self.max_token_length,
            return_tensors="np",
        )
        outputs = self.model(**encoded)
        pooled = self._mean_pool(outputs.last_hidden_state, encoded["attention_mask"])
        embeddings = self._normalize(pooled).astype(np.float32)
        self.dimension = int(embeddings.shape[1])
        return embeddings

    def embed_one(self, text: str) -> np.ndarray:
        return self.embed([text])[0]

    @staticmethod
    def _mean_pool(last_hidden: np.ndarray, attention_mask: np.ndarray) -> np.ndarray:
        mask = attention_mask[..., None]
        masked = last_hidden * mask
        summed = masked.sum(axis=1)
        counts = np.clip(mask.sum(axis=1), 1e-9, None)
        return summed / counts

    @staticmethod
    def _normalize(vectors: np.ndarray) -> np.ndarray:
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        return vectors / np.clip(norms, 1e-12, None)
