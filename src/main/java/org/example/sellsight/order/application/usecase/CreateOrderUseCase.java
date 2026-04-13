package org.example.sellsight.order.application.usecase;

import org.example.sellsight.order.application.dto.*;
import org.example.sellsight.order.domain.model.*;
import org.example.sellsight.order.domain.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Use case: Create a new order for the authenticated customer.
 */
@Service
public class CreateOrderUseCase {

    private final OrderRepository orderRepository;

    public CreateOrderUseCase(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public OrderDto execute(CreateOrderRequest request, String customerId) {
        Order order = new Order(
                OrderId.generate(),
                customerId,
                List.of(),
                OrderStatus.PENDING,
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        // Add items
        for (OrderItemRequest itemReq : request.items()) {
            order.addItem(new OrderItem(
                    itemReq.productId(),
                    itemReq.productName(),
                    itemReq.quantity(),
                    itemReq.unitPrice()
            ));
        }

        // Auto-confirm
        order.confirm();

        Order saved = orderRepository.save(order);
        return toDto(saved);
    }

    static OrderDto toDto(Order o) {
        List<OrderItemDto> itemDtos = o.getItems().stream()
                .map(i -> new OrderItemDto(
                        i.getProductId(), i.getProductName(),
                        i.getQuantity(), i.getUnitPrice(), i.getSubtotal()))
                .toList();

        return new OrderDto(
                o.getId().getValue(), o.getCustomerId(), itemDtos,
                o.getTotal(), o.getStatus().name(),
                o.getCreatedAt(), o.getUpdatedAt()
        );
    }
}
