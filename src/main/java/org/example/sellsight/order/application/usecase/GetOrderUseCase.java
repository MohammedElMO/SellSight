package org.example.sellsight.order.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.order.application.dto.OrderDto;
import org.example.sellsight.order.domain.exception.OrderNotFoundException;
import org.example.sellsight.order.domain.model.Order;
import org.example.sellsight.order.domain.model.OrderId;
import org.example.sellsight.order.domain.repository.OrderRepository;
import org.springframework.stereotype.Service;

/**
 * Use case: Get a single order by ID.
 */
@Slf4j
@Service
public class GetOrderUseCase {

    private final OrderRepository orderRepository;

    public GetOrderUseCase(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public OrderDto execute(String orderId) {
        Order order = orderRepository.findById(OrderId.from(orderId))
                .orElseThrow(() -> new OrderNotFoundException(orderId));
        return CreateOrderUseCase.toDto(order);
    }
}
