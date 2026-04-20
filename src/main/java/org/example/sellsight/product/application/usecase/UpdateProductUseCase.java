package org.example.sellsight.product.application.usecase;

import org.example.sellsight.product.application.dto.ProductDto;
import org.example.sellsight.product.application.dto.UpdateProductRequest;
import org.example.sellsight.product.domain.exception.ProductNotFoundException;
import org.example.sellsight.product.domain.exception.UnauthorizedProductAccessException;
import org.example.sellsight.product.domain.model.Money;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Use case: Update an existing product.
 * Only the seller who owns the product or an ADMIN can update.
 */
@Service
public class UpdateProductUseCase {

    private final ProductRepository productRepository;

    public UpdateProductUseCase(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "products", key = "#productId"),
        @CacheEvict(value = "product-listings", allEntries = true)
    })
    public ProductDto execute(String productId, UpdateProductRequest request,
                               String sellerId, String role) {
        ProductId id = ProductId.from(productId);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        // Authorization check — seller can only update own products
        if (!"ADMIN".equals(role) && !product.getSellerId().equals(sellerId)) {
            throw new UnauthorizedProductAccessException();
        }

        product.updateDetails(
                request.name(),
                request.description(),
                new Money(request.price()),
                request.category(),
                request.imageUrl()
        );

        Product saved = productRepository.save(product);
        return toDto(saved);
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
