package org.example.sellsight.product.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.inventory.domain.repository.InventoryRepository;
import org.example.sellsight.product.application.dto.ProductDto;
import org.example.sellsight.product.domain.exception.ProductNotFoundException;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Use case: Get a single product by ID.
 */
@Slf4j
@Service
public class GetProductByIdUseCase {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public GetProductByIdUseCase(ProductRepository productRepository, InventoryRepository inventoryRepository) {
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Cacheable(value = "products", key = "#productId")
    @Transactional(readOnly = true)
    public ProductDto execute(String productId) {
        ProductId id = ProductId.from(productId);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        int stock = inventoryRepository.findByProductId(productId)
                .map(inv -> inv.getStockLevel().getQuantity())
                .orElse(0);

        return new ProductDto(
                product.getId().getValue(), product.getName(), product.getDescription(),
                product.getPrice().getAmount(), product.getCategory(), product.getSellerId(),
                product.getImageUrl(), product.getBrand(),
                product.getRatingAvg(), product.getRatingCount(), product.getSoldCount(),
                product.isActive(), product.getCreatedAt(), product.getUpdatedAt(), stock
        );
    }
}
