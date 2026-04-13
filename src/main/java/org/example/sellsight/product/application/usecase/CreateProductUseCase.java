package org.example.sellsight.product.application.usecase;

import org.example.sellsight.product.application.dto.CreateProductRequest;
import org.example.sellsight.product.application.dto.ProductDto;
import org.example.sellsight.product.domain.model.Money;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Use case: Create a new product.
 */
@Service
public class CreateProductUseCase {

    private final ProductRepository productRepository;

    public CreateProductUseCase(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public ProductDto execute(CreateProductRequest request, String sellerId) {
        Product product = new Product(
                ProductId.generate(),
                request.name(),
                request.description(),
                new Money(request.price()),
                request.category(),
                sellerId,
                request.imageUrl(),
                true,
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        Product saved = productRepository.save(product);
        return toDto(saved);
    }

    private ProductDto toDto(Product p) {
        return new ProductDto(
                p.getId().getValue(), p.getName(), p.getDescription(),
                p.getPrice().getAmount(), p.getCategory(), p.getSellerId(),
                p.getImageUrl(), p.isActive(), p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
