package org.example.sellsight.product.application.usecase;

import org.example.sellsight.product.application.dto.ProductDto;
import org.example.sellsight.product.application.dto.ProductPageDto;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductSlice;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Use case: Search products using full-text search.
 */
@Service
public class SearchProductsUseCase {

    private final ProductRepository productRepository;

    public SearchProductsUseCase(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public ProductPageDto execute(String query, int page, int size) {
        if (query == null || query.trim().isEmpty()) {
            return new ProductPageDto(List.of(), page, size, false);
        }
        ProductSlice slice = productRepository.search(query, page, size);
        List<ProductDto> dtos = slice.items().stream().map(this::toDto).toList();
        return new ProductPageDto(dtos, page, size, slice.hasMore());
    }

    private ProductDto toDto(Product p) {
        return new ProductDto(
                p.getId().getValue(), p.getName(), p.getDescription(),
                p.getPrice().getAmount(), p.getCategory(), p.getSellerId(),
                p.getImageUrl(), p.getBrand(), p.getRatingAvg(), p.getRatingCount(), p.getSoldCount(),
                p.isActive(), p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
