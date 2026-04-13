package org.example.sellsight.order.application.usecase;

import org.example.sellsight.order.application.dto.OrderDto;
import org.example.sellsight.order.domain.exception.OrderNotFoundException;
import org.example.sellsight.order.domain.model.Order;
import org.example.sellsight.order.domain.model.OrderId;
import org.example.sellsight.order.domain.model.OrderStatus;
import org.example.sellsight.order.domain.repository.OrderRepository;
import org.springframework.stereotype.Service;

/**
 * Use case: Update an order's status (state machine transitions).
 */
@Service
public class UpdateOrderStatusUseCase {

    private final OrderRepository orderRepository;

    public UpdateOrderStatusUseCase(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public OrderDto execute(String orderId, String newStatus) {
        Order order = orderRepository.findById(OrderId.from(orderId))
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        OrderStatus target = OrderStatus.valueOf(newStatus.toUpperCase());

        switch (target) {
            case CONFIRMED -> order.confirm();
            case SHIPPED -> order.ship();
            case DELIVERED -> order.deliver();
            case CANCELLED -> order.cancel();
            default -> throw new IllegalArgumentException("Invalid target status: " + newStatus);
        }

        Order saved = orderRepository.save(order);
        return CreateOrderUseCase.toDto(saved);
    }
}
