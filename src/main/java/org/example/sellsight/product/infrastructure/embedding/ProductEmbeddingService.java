package org.example.sellsight.product.infrastructure.embedding;

import org.example.sellsight.product.domain.port.EmbeddingPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class ProductEmbeddingService implements EmbeddingPort {
    private static final Logger log = LoggerFactory.getLogger(ProductEmbeddingService.class);

    @Override
    public float[] embed(String text) throws Exception {
        return new float[0];
    }

    @Async
    public void updateEmbeddingAsync(String id, String name, String description) {
        log.debug("Embedding update skipped for product {} (stub)", id);
    }
}
