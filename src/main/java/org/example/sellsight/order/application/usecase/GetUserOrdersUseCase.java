package org.example.sellsight.order.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.order.application.dto.OrderDto;
import org.example.sellsight.order.domain.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Use case: Get all orders for a specific customer.
 */
@Slf4j
@Service
public class GetUserOrdersUseCase {

    private final OrderRepository orderRepository;

    public GetUserOrdersUseCase(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<OrderDto> execute(String customerId) {
        return orderRepository.findByCustomerId(customerId).stream()
                .map(CreateOrderUseCase::toDto)
                .toList();
    }

    public List<OrderDto> executeAll() {
        return orderRepository.findAll().stream()
                .map(CreateOrderUseCase::toDto)
                .toList();
    }
}
