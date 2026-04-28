package org.example.sellsight.inventory.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.engagement.application.usecase.ManageBackInStockSubscriptionUseCase;
import org.example.sellsight.inventory.application.dto.StockDto;
import org.example.sellsight.inventory.application.dto.UpdateStockRequest;
import org.example.sellsight.inventory.domain.model.InventoryItem;
import org.example.sellsight.inventory.domain.model.StockLevel;
import org.example.sellsight.inventory.domain.repository.InventoryRepository;
import org.example.sellsight.product.infrastructure.persistence.repository.ProductJpaRepository;
import org.springframework.stereotype.Service;

/**
 * Use case: Update stock level for a product.
 * Creates an inventory item if it doesn't exist yet.
 * Fires back-in-stock notifications when restocked from zero.
 */
@Slf4j
@Service
public class UpdateStockUseCase {

    private final InventoryRepository inventoryRepository;
    private final ManageBackInStockSubscriptionUseCase backInStockUseCase;
    private final ProductJpaRepository productJpaRepository;

    public UpdateStockUseCase(InventoryRepository inventoryRepository,
                               ManageBackInStockSubscriptionUseCase backInStockUseCase,
                               ProductJpaRepository productJpaRepository) {
        this.inventoryRepository = inventoryRepository;
        this.backInStockUseCase = backInStockUseCase;
        this.productJpaRepository = productJpaRepository;
    }

    public StockDto execute(String productId, UpdateStockRequest request) {
        InventoryItem item = inventoryRepository.findByProductId(productId)
                .orElse(new InventoryItem(productId, StockLevel.zero(),
                        request.reorderThreshold() != null ? request.reorderThreshold() : 5));

        // Replace stock level
        int newQuantity = request.quantity();
        int currentQuantity = item.getStockLevel().getQuantity();

        if (newQuantity > currentQuantity) {
            item.increaseStock(newQuantity - currentQuantity);
        } else if (newQuantity < currentQuantity) {
            item.decreaseStock(currentQuantity - newQuantity);
        }

        if (request.reorderThreshold() != null) {
            item.setReorderThreshold(request.reorderThreshold());
        }

        InventoryItem saved = inventoryRepository.save(item);

        // Notify subscribers when restocked from zero
        if (currentQuantity == 0 && newQuantity > 0) {
            String productName = productJpaRepository.findById(productId)
                    .map(p -> p.getName())
                    .orElse("Product");
            try {
                backInStockUseCase.notifyAndClear(productId, productName);
            } catch (Exception e) {
                log.warn("Failed to send back-in-stock notifications for {}: {}", productId, e.getMessage());
            }
        }

        return toDto(saved);
    }

    static StockDto toDto(InventoryItem item) {
        return new StockDto(
                item.getProductId(),
                item.getStockLevel().getQuantity(),
                item.getReorderThreshold(),
                item.isLowStock()
        );
    }
}
