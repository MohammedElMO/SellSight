package org.example.sellsight.product.application.usecase;

import org.example.sellsight.product.domain.exception.ProductNotFoundException;
import org.example.sellsight.product.domain.exception.UnauthorizedProductAccessException;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Use case: Delete (soft-delete) a product.
 */
@Service
public class DeleteProductUseCase {

    private final ProductRepository productRepository;

    public DeleteProductUseCase(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "products", key = "#productId"),
        @CacheEvict(value = "product-listings", allEntries = true)
    })
    public void execute(String productId, String sellerId, String role) {
        ProductId id = ProductId.from(productId);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        if (!"ADMIN".equals(role) && !product.getSellerId().equals(sellerId)) {
            throw new UnauthorizedProductAccessException();
        }

        product.deactivate();
        productRepository.save(product);
    }
}
