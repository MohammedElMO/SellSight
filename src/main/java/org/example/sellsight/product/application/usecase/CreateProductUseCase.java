package org.example.sellsight.product.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.inventory.domain.model.InventoryItem;
import org.example.sellsight.inventory.domain.model.StockLevel;
import org.example.sellsight.inventory.domain.repository.InventoryRepository;
import org.example.sellsight.product.application.dto.CreateProductRequest;
import org.example.sellsight.product.application.dto.ProductDto;
import org.example.sellsight.product.domain.model.Money;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Use case: Create a new product.
 */
@Slf4j
@Service
public class CreateProductUseCase {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public CreateProductUseCase(ProductRepository productRepository,
                                InventoryRepository inventoryRepository) {
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional
    @CacheEvict(value = "product-listings", allEntries = true)
    public ProductDto execute(CreateProductRequest request, String sellerId) {
        log.info("Creating product: name='{}' category='{}' seller={}", request.name(), request.category(), sellerId);
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

        int initialStock = request.initialStock() != null ? request.initialStock() : 0;
        InventoryItem inventory = new InventoryItem(
                saved.getId().getValue(), StockLevel.of(initialStock), 5);
        inventoryRepository.save(inventory);
        log.info("Product created: id={} name='{}' seller={} initialStock={}",
                saved.getId().getValue(), saved.getName(), sellerId, initialStock);
        return toDto(saved);
    }

    private ProductDto toDto(Product p) {
        return new ProductDto(
                p.getId().getValue(), p.getName(), p.getDescription(),
                p.getPrice().getAmount(), p.getCategory(), p.getSellerId(),
                p.getImageUrl(), p.getBrand(), p.getRatingAvg(), p.getRatingCount(), p.getSoldCount(),
                p.isActive(), p.getCreatedAt(), p.getUpdatedAt(), 0
        );
    }
}
