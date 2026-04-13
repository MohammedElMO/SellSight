package org.example.sellsight.inventory.infrastructure.persistence.repository;

import org.example.sellsight.inventory.infrastructure.persistence.entity.InventoryJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryJpaRepository extends JpaRepository<InventoryJpaEntity, String> {

    @Query("SELECT i FROM InventoryJpaEntity i WHERE i.quantity <= i.reorderThreshold")
    List<InventoryJpaEntity> findLowStock();
}
