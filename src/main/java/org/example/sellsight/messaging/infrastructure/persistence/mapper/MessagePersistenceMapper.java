package org.example.sellsight.messaging.infrastructure.persistence.mapper;

import org.example.sellsight.messaging.domain.model.OrderMessage;
import org.example.sellsight.messaging.infrastructure.persistence.entity.OrderMessageJpaEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MessagePersistenceMapper {

    OrderMessageJpaEntity toJpa(OrderMessage message);

    default OrderMessage toDomain(OrderMessageJpaEntity e) {
        return new OrderMessage(
                e.getId(), e.getOrderId(), e.getSenderId(),
                e.getSenderRole(), e.getBody(), e.getSentAt()
        );
    }
}
