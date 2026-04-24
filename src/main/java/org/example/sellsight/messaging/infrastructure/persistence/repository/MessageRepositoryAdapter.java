package org.example.sellsight.messaging.infrastructure.persistence.repository;

import org.example.sellsight.messaging.domain.model.OrderMessage;
import org.example.sellsight.messaging.domain.repository.MessageRepository;
import org.example.sellsight.messaging.infrastructure.persistence.entity.OrderMessageJpaEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MessageRepositoryAdapter implements MessageRepository {

    private final MessageJpaRepository jpa;

    public MessageRepositoryAdapter(MessageJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public OrderMessage save(OrderMessage m) {
        return toDomain(jpa.save(toJpa(m)));
    }

    @Override
    public List<OrderMessage> findByOrderId(String orderId) {
        return jpa.findByOrderIdOrderBySentAtAsc(orderId).stream().map(this::toDomain).toList();
    }

    private OrderMessageJpaEntity toJpa(OrderMessage m) {
        return new OrderMessageJpaEntity(
                m.getId(), m.getOrderId(), m.getSenderId(),
                m.getSenderRole(), m.getBody(), m.getSentAt());
    }

    private OrderMessage toDomain(OrderMessageJpaEntity e) {
        return new OrderMessage(
                e.getId(), e.getOrderId(), e.getSenderId(),
                e.getSenderRole(), e.getBody(), e.getSentAt());
    }
}
