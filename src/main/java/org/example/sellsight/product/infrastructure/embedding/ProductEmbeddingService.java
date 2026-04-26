package org.example.sellsight.product.infrastructure.embedding;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.product.domain.port.EmbeddingPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Slf4j
@Component
public class ProductEmbeddingService {

    private static final int MAX_TEXT_CHARS = 300;

    private final EmbeddingPort embeddingPort;
    private final JdbcTemplate jdbcTemplate;

    public ProductEmbeddingService(EmbeddingPort embeddingPort, JdbcTemplate jdbcTemplate) {
        this.embeddingPort = embeddingPort;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Async
    public void updateEmbeddingAsync(String productId, String name, String description, String category) {
        try {
            String text = buildEmbeddingText(name, description, category);
            if (text.isBlank()) {
                log.debug("Skipping embedding update for product {} because text is empty", productId);
                return;
            }
            float[] embedding = embeddingPort.embed(text);
            String vectorStr = Arrays.toString(embedding).replace(" ", "");
            jdbcTemplate.update(
                "UPDATE products SET embedding = CAST(? AS vector) WHERE id = ?",
                vectorStr, productId
            );
            log.debug("Embedding updated for product {}", productId);
        } catch (Exception e) {
            log.warn("Failed to update embedding for product {}: {}", productId, e.getMessage());
        }
    }

    private String buildEmbeddingText(String name, String description, String category) {
        StringBuilder sb = new StringBuilder();
        appendPart(sb, name);
        appendPart(sb, category);
        appendPart(sb, description);
        String compact = sb.toString().trim().replaceAll("\\s+", " ");
        return compact.length() > MAX_TEXT_CHARS
            ? compact.substring(0, MAX_TEXT_CHARS)
            : compact;
    }

    private void appendPart(StringBuilder sb, String value) {
        if (value == null || value.isBlank()) {
            return;
        }
        if (!sb.isEmpty()) {
            sb.append(' ');
        }
        sb.append(value.trim());
    }
}
