package org.example.sellsight.messaging.domain.repository;

import org.example.sellsight.messaging.domain.model.OrderMessage;

import java.util.List;

public interface MessageRepository {
    OrderMessage save(OrderMessage message);
    List<OrderMessage> findByOrderId(String orderId);
}
