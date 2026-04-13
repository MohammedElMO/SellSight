package org.example.sellsight.inventory.infrastructure.persistence.repository;

import org.example.sellsight.inventory.domain.model.InventoryItem;
import org.example.sellsight.inventory.domain.model.StockLevel;
import org.example.sellsight.inventory.domain.repository.InventoryRepository;
import org.example.sellsight.inventory.infrastructure.persistence.entity.InventoryJpaEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class InventoryRepositoryAdapter implements InventoryRepository {

    private final InventoryJpaRepository jpaRepository;

    public InventoryRepositoryAdapter(InventoryJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public InventoryItem save(InventoryItem item) {
        InventoryJpaEntity entity = new InventoryJpaEntity(
                item.getProductId(),
                item.getStockLevel().getQuantity(),
                item.getReorderThreshold()
        );
        InventoryJpaEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<InventoryItem> findByProductId(String productId) {
        return jpaRepository.findById(productId).map(this::toDomain);
    }

    @Override
    public List<InventoryItem> findLowStock() {
        return jpaRepository.findLowStock().stream().map(this::toDomain).toList();
    }

    @Override
    public boolean existsByProductId(String productId) {
        return jpaRepository.existsById(productId);
    }

    private InventoryItem toDomain(InventoryJpaEntity e) {
        return new InventoryItem(e.getProductId(), StockLevel.of(e.getQuantity()), e.getReorderThreshold());
    }
}
