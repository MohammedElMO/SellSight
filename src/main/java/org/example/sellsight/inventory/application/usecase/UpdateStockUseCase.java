package org.example.sellsight.inventory.application.usecase;

import org.example.sellsight.inventory.application.dto.StockDto;
import org.example.sellsight.inventory.application.dto.UpdateStockRequest;
import org.example.sellsight.inventory.domain.exception.InventoryNotFoundException;
import org.example.sellsight.inventory.domain.model.InventoryItem;
import org.example.sellsight.inventory.domain.model.StockLevel;
import org.example.sellsight.inventory.domain.repository.InventoryRepository;
import org.springframework.stereotype.Service;

/**
 * Use case: Update stock level for a product.
 * Creates inventory item if it doesn't exist yet.
 */
@Service
public class UpdateStockUseCase {

    private final InventoryRepository inventoryRepository;

    public UpdateStockUseCase(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
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
