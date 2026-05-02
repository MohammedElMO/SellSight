package org.example.sellsight.product.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.product.application.dto.ProductDto;
import org.example.sellsight.product.application.dto.UpdateProductRequest;
import org.example.sellsight.product.application.mapper.ProductDtoMapper;
import org.example.sellsight.product.domain.exception.ProductNotFoundException;
import org.example.sellsight.product.domain.exception.UnauthorizedProductAccessException;
import org.example.sellsight.product.domain.model.Money;
import org.example.sellsight.product.domain.model.Product;
import org.example.sellsight.product.domain.model.ProductId;
import org.example.sellsight.product.domain.repository.ProductRepository;
import org.example.sellsight.product.infrastructure.embedding.ProductEmbeddingService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Use case: Update an existing product.
 * Only the seller who owns the product or an ADMIN can update.
 */
@Slf4j
@Service
public class UpdateProductUseCase {

    private final ProductRepository productRepository;
    private final ProductEmbeddingService embeddingService;
    private final ProductDtoMapper productDtoMapper;

    public UpdateProductUseCase(ProductRepository productRepository,
                                ProductEmbeddingService embeddingService,
                                ProductDtoMapper productDtoMapper) {
        this.productRepository = productRepository;
        this.embeddingService = embeddingService;
        this.productDtoMapper = productDtoMapper;
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
