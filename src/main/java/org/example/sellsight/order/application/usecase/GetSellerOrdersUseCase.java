package org.example.sellsight.order.application.usecase;

import org.example.sellsight.order.application.dto.OrderDto;
import org.example.sellsight.order.application.dto.OrderItemDto;
import org.example.sellsight.order.domain.model.Order;
import org.example.sellsight.order.domain.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Use case: Get seller-scoped orders.
 * Returns orders containing the seller's items, filtered to only show the seller's own items.
 */
@Service
public class GetSellerOrdersUseCase {

    private final OrderRepository orderRepository;

    public GetSellerOrdersUseCase(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Returns all orders that contain at least one item belonging to this seller.
     * Each order's items are filtered to only include the seller's items (data isolation).
     */
    public List<OrderDto> execute(String sellerId) {
        return orderRepository.findBySellerId(sellerId).stream()
                .map(order -> toSellerScopedDto(order, sellerId))
                .toList();
    }

    /**
     * Converts an Order to a DTO showing only the seller's own items.
     * Total reflects the seller's subtotal, not the full order total.
     */
    private OrderDto toSellerScopedDto(Order order, String sellerId) {
        List<OrderItemDto> sellerItems = order.getItems().stream()
                .filter(item -> sellerId.equals(item.getSellerId()))
                .map(i -> new OrderItemDto(
                        i.getProductId(), i.getProductName(), i.getSellerId(),
                        i.getQuantity(), i.getUnitPrice(), i.getSubtotal()))
                .toList();

        var sellerTotal = sellerItems.stream()
                .map(OrderItemDto::subtotal)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        return new OrderDto(
                order.getId().getValue(),
                order.getCustomerId(),
                sellerItems,
                sellerTotal,
                order.getStatus().name(),
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
