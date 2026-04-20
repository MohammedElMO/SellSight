package org.example.sellsight.inventory.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.inventory.application.dto.StockDto;
import org.example.sellsight.inventory.domain.exception.InventoryNotFoundException;
import org.example.sellsight.inventory.domain.repository.InventoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Use case: Get stock info for a product or all low-stock items.
 */
@Slf4j
@Service
public class GetStockUseCase {

    private final InventoryRepository inventoryRepository;

    public GetStockUseCase(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public StockDto execute(String productId) {
        return inventoryRepository.findByProductId(productId)
                .map(UpdateStockUseCase::toDto)
                .orElseThrow(() -> new InventoryNotFoundException(productId));
    }

    public List<StockDto> getLowStock() {
        return inventoryRepository.findLowStock().stream()
                .map(UpdateStockUseCase::toDto)
                .toList();
    }
}
