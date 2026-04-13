package org.example.sellsight.product.application.usecase;

import org.example.sellsight.product.domain.exception.ProductNotFoundException;
import org.example.sellsight.product.domain.exception.UnauthorizedProductAccessException;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.springframework.stereotype.Service;

/**
 * Use case: Delete (soft-delete) a product.
 */
@Service
public class DeleteProductUseCase {

    private final ProductRepository productRepository;

    public DeleteProductUseCase(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

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
