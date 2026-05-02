package org.example.sellsight.inventory.infrastructure.persistence.repository;

import org.example.sellsight.inventory.domain.model.InventoryItem;
import org.example.sellsight.inventory.domain.repository.InventoryRepository;
import org.example.sellsight.inventory.infrastructure.persistence.mapper.InventoryPersistenceMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class InventoryRepositoryAdapter implements InventoryRepository {

    private final InventoryJpaRepository jpaRepository;
    private final InventoryPersistenceMapper mapper;

    public InventoryRepositoryAdapter(InventoryJpaRepository jpaRepository, InventoryPersistenceMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public InventoryItem save(InventoryItem item) {
        return mapper.toDomain(jpaRepository.save(mapper.toJpa(item)));
    }

    @Override
    public Optional<InventoryItem> findByProductId(String productId) {
        return jpaRepository.findById(productId).map(mapper::toDomain);
    }

    @Override
    public List<InventoryItem> findAllByProductIds(List<String> productIds) {
        if (productIds == null || productIds.isEmpty()) return List.of();
        return jpaRepository.findAllByProductIdIn(productIds).stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<InventoryItem> findLowStock() {
        return jpaRepository.findLowStock().stream().map(mapper::toDomain).toList();
    }

    @Override
    public boolean existsByProductId(String productId) {
        return jpaRepository.existsById(productId);
    }
}
