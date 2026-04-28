package org.example.sellsight.product.domain.port;

public interface EmbeddingPort {
    float[] embed(String text) throws Exception;
}
