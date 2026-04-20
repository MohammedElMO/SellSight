package org.example.sellsight.inventory.domain.repository;

import org.example.sellsight.inventory.domain.model.InventoryItem;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository {

    InventoryItem save(InventoryItem item);

    Optional<InventoryItem> findByProductId(String productId);

    List<InventoryItem> findAllByProductIds(List<String> productIds);

    List<InventoryItem> findLowStock();

    boolean existsByProductId(String productId);
}
