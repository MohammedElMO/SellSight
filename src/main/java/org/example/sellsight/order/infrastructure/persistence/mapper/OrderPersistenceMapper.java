package org.example.sellsight.order.infrastructure.persistence.mapper;

import org.example.sellsight.order.domain.model.Order;
import org.example.sellsight.order.domain.model.OrderId;
import org.example.sellsight.order.domain.model.OrderItem;
import org.example.sellsight.order.infrastructure.persistence.entity.OrderItemJpaEntity;
import org.example.sellsight.order.infrastructure.persistence.entity.OrderJpaEntity;
import org.mapstruct.Mapper;

import java.util.ArrayList;
import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderPersistenceMapper {

    default Order toDomain(OrderJpaEntity entity) {
        List<OrderItem> items = entity.getItems().stream()
                .map(i -> new OrderItem(i.getProductId(), i.getProductName(),
                        i.getSellerId(), i.getQuantity(), i.getUnitPrice()))
                .toList();
        return new Order(
                OrderId.from(entity.getId()),
                entity.getCustomerId(),
                items,
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    default OrderJpaEntity toJpa(Order order) {
        OrderJpaEntity entity = new OrderJpaEntity();
        entity.setId(order.getId().getValue());
        entity.setCustomerId(order.getCustomerId());
        entity.setStatus(order.getStatus());
        entity.setCreatedAt(order.getCreatedAt());
        entity.setUpdatedAt(order.getUpdatedAt());

        List<OrderItemJpaEntity> itemEntities = order.getItems().stream()
                .map(item -> {
                    OrderItemJpaEntity ie = new OrderItemJpaEntity();
                    ie.setProductId(item.getProductId());
                    ie.setProductName(item.getProductName());
                    ie.setSellerId(item.getSellerId());
                    ie.setQuantity(item.getQuantity());
                    ie.setUnitPrice(item.getUnitPrice());
                    ie.setOrder(entity);
                    return ie;
                })
                .toList();

        entity.setItems(new ArrayList<>(itemEntities));
        return entity;
    }
}
