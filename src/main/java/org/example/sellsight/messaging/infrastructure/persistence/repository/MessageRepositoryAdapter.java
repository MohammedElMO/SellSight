package org.example.sellsight.messaging.infrastructure.persistence.repository;

import org.example.sellsight.messaging.domain.model.OrderMessage;
import org.example.sellsight.messaging.domain.repository.MessageRepository;
import org.example.sellsight.messaging.infrastructure.persistence.mapper.MessagePersistenceMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MessageRepositoryAdapter implements MessageRepository {

    private final MessageJpaRepository jpa;
    private final MessagePersistenceMapper mapper;

    public MessageRepositoryAdapter(MessageJpaRepository jpa, MessagePersistenceMapper mapper) {
        this.jpa = jpa;
        this.mapper = mapper;
    }

    @Override
    public OrderMessage save(OrderMessage m) {
        return mapper.toDomain(jpa.save(mapper.toJpa(m)));
    }

    @Override
    public List<OrderMessage> findByOrderId(String orderId) {
        return jpa.findByOrderIdOrderBySentAtAsc(orderId).stream().map(mapper::toDomain).toList();
    }
}
