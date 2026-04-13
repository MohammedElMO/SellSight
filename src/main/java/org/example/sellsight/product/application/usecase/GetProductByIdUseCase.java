package org.example.sellsight.product.application.usecase;

import org.example.sellsight.product.application.dto.ProductDto;
import org.example.sellsight.product.domain.exception.ProductNotFoundException;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.springframework.stereotype.Service;

/**
 * Use case: Get a single product by ID.
 */
@Service
public class GetProductByIdUseCase {

    private final ProductRepository productRepository;

    public GetProductByIdUseCase(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public ProductDto execute(String productId) {
        ProductId id = ProductId.from(productId);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        return new ProductDto(
                product.getId().getValue(), product.getName(), product.getDescription(),
                product.getPrice().getAmount(), product.getCategory(), product.getSellerId(),
                product.getImageUrl(), product.isActive(), product.getCreatedAt(), product.getUpdatedAt()
        );
    }
}
