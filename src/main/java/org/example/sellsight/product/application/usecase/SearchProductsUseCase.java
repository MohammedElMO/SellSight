package org.example.sellsight.product.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.inventory.domain.model.InventoryItem;
import org.example.sellsight.inventory.domain.repository.InventoryRepository;
import org.example.sellsight.product.application.dto.ProductDto;
import org.example.sellsight.product.application.dto.ProductPageDto;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductSlice;
import org.example.sellsight.product.domain.port.EmbeddingPort;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Use case: Search products using hybrid semantic + full-text search.
 * Falls back to full-text only when the embedding service is unavailable.
 */
@Slf4j
@Service
public class SearchProductsUseCase {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final EmbeddingPort embeddingPort;

    public SearchProductsUseCase(ProductRepository productRepository,
                                  InventoryRepository inventoryRepository,
                                  EmbeddingPort embeddingPort) {
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.embeddingPort = embeddingPort;
    }

    @Transactional(readOnly = true)
    public ProductPageDto execute(String query, int page, int size) {
        if (query == null || query.trim().isEmpty()) {
            return new ProductPageDto(List.of(), page, size, false, 0, 0L);
        }
        String q = query.trim();
        ProductSlice slice;
        try {
            float[] embedding = embeddingPort.embed(q);
            slice = productRepository.hybridSearch(q, embedding, page, size);
        } catch (Exception e) {
            log.warn("Embedding service unavailable, using full-text search: {}", e.getMessage());
            slice = productRepository.search(q, page, size);
        }
        List<Product> products = slice.items();
        List<String> ids = products.stream().map(p -> p.getId().getValue()).toList();
        Map<String, Integer> stockMap = inventoryRepository.findAllByProductIds(ids).stream()
                .collect(Collectors.toMap(InventoryItem::getProductId, i -> i.getStockLevel().getQuantity()));
        List<ProductDto> dtos = products.stream().map(p -> toDto(p, stockMap)).toList();
        int totalPages = size == 0 ? 0 : (int) Math.ceil((double) slice.totalElements() / size);
        return new ProductPageDto(dtos, page, size, slice.hasMore(), totalPages, slice.totalElements());
    }

    private ProductDto toDto(Product p, Map<String, Integer> stockMap) {
        return new ProductDto(
                p.getId().getValue(), p.getName(), p.getDescription(),
                p.getPrice().getAmount(), p.getCategory(), p.getSellerId(),
                p.getImageUrl(), p.getBrand(), p.getRatingAvg(), p.getRatingCount(), p.getSoldCount(),
                p.isActive(), p.getCreatedAt(), p.getUpdatedAt(),
                stockMap.getOrDefault(p.getId().getValue(), 0)
        );
    }
}
