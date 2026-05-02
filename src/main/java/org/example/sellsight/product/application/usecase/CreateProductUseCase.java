package org.example.sellsight.product.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.inventory.domain.model.InventoryItem;
import org.example.sellsight.inventory.domain.model.StockLevel;
import org.example.sellsight.inventory.domain.repository.InventoryRepository;
import org.example.sellsight.product.application.dto.CreateProductRequest;
import org.example.sellsight.product.application.dto.ProductDto;
import org.example.sellsight.product.domain.model.Money;
import org.example.sellsight.product.application.mapper.ProductDtoMapper;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.example.sellsight.product.infrastructure.embedding.ProductEmbeddingService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;

/**
 * Use case: Create a new product.
 */
@Slf4j
@Service
public class CreateProductUseCase {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductEmbeddingService embeddingService;
    private final ProductDtoMapper productDtoMapper;

    public CreateProductUseCase(ProductRepository productRepository,
                                InventoryRepository inventoryRepository,
                                ProductEmbeddingService embeddingService,
                                ProductDtoMapper productDtoMapper) {
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.embeddingService = embeddingService;
        this.productDtoMapper = productDtoMapper;
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

        String savedId = saved.getId().getValue();
        String savedName = saved.getName();
        String savedDescription = saved.getDescription();
        String savedCategory = saved.getCategory();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                embeddingService.updateEmbeddingAsync(savedId, savedName, savedDescription, savedCategory);
            }
        });

        return productDtoMapper.toDto(saved, 0);
    }
}
