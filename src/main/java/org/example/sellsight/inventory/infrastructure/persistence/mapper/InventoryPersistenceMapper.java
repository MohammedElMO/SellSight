package org.example.sellsight.inventory.infrastructure.persistence.mapper;

import org.example.sellsight.inventory.domain.model.InventoryItem;
import org.example.sellsight.inventory.domain.model.StockLevel;
import org.example.sellsight.inventory.infrastructure.persistence.entity.InventoryJpaEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryPersistenceMapper {

    @Mapping(target = "quantity", expression = "java(item.getStockLevel().getQuantity())")
    InventoryJpaEntity toJpa(InventoryItem item);

    default InventoryItem toDomain(InventoryJpaEntity e) {
        return new InventoryItem(e.getProductId(), StockLevel.of(e.getQuantity()), e.getReorderThreshold());
    }
}
