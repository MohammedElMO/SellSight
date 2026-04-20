package org.example.sellsight.order.application.usecase;

import com.stripe.model.PaymentIntent;
import com.stripe.exception.StripeException;
import org.example.sellsight.engagement.application.usecase.SendNotificationUseCase;
import org.example.sellsight.inventory.domain.exception.InsufficientStockException;
import org.example.sellsight.inventory.domain.model.InventoryItem;
import org.example.sellsight.inventory.domain.repository.InventoryRepository;
import org.example.sellsight.loyalty.application.usecase.GetLoyaltyAccountUseCase;
import org.example.sellsight.order.application.dto.*;
import org.example.sellsight.order.domain.model.*;
import org.example.sellsight.order.domain.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Use case: Create a new order for the authenticated customer.
 */
@Service
public class CreateOrderUseCase {

    private static final Logger log = LoggerFactory.getLogger(CreateOrderUseCase.class);

    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final GetLoyaltyAccountUseCase getLoyaltyAccountUseCase;
    private final SendNotificationUseCase sendNotificationUseCase;

    public CreateOrderUseCase(OrderRepository orderRepository,
                               InventoryRepository inventoryRepository,
                               GetLoyaltyAccountUseCase getLoyaltyAccountUseCase,
                               SendNotificationUseCase sendNotificationUseCase) {
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
        this.getLoyaltyAccountUseCase = getLoyaltyAccountUseCase;
        this.sendNotificationUseCase = sendNotificationUseCase;
    }

    @Transactional
    public OrderDto execute(CreateOrderRequest request, String customerId) {
        // Stripe validation — fast network call, happens before any DB write
        if (request.paymentIntentId() != null && !request.paymentIntentId().trim().isEmpty() && !request.paymentIntentId().startsWith("pi_simulated")) {
            try {
                PaymentIntent intent = PaymentIntent.retrieve(request.paymentIntentId());
                if (!"succeeded".equals(intent.getStatus()) && !"requires_capture".equals(intent.getStatus())) {
                    throw new RuntimeException("PaymentIntent is not in a succeeded state. Status: " + intent.getStatus());
                }
            } catch (StripeException e) {
                throw new RuntimeException("Failed to verify PaymentIntent with Stripe: " + e.getMessage());
            }
        }

        // Validate stock availability before touching the DB
        for (OrderItemRequest itemReq : request.items()) {
            InventoryItem stock = inventoryRepository.findByProductId(itemReq.productId())
                    .orElseThrow(() -> new InsufficientStockException(itemReq.productId(), 0, itemReq.quantity()));
            if (stock.getStockLevel().getQuantity() < itemReq.quantity()) {
                throw new InsufficientStockException(
                        itemReq.productId(), stock.getStockLevel().getQuantity(), itemReq.quantity());
            }
        }

        Order order = new Order(
                OrderId.generate(),
                customerId,
                List.of(),
                OrderStatus.PENDING,
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        for (OrderItemRequest itemReq : request.items()) {
            order.addItem(new OrderItem(
                    itemReq.productId(),
                    itemReq.productName(),
                    itemReq.quantity(),
                    itemReq.unitPrice()
            ));
        }

        order.confirm();
        Order saved = orderRepository.save(order);

        // Decrement inventory after successful order save
        for (OrderItemRequest itemReq : request.items()) {
            inventoryRepository.findByProductId(itemReq.productId()).ifPresent(inv -> {
                inv.decreaseStock(itemReq.quantity());
                inventoryRepository.save(inv);
            });
        }

        // Award loyalty points — fire-and-forget, never fails the order
        try {
            getLoyaltyAccountUseCase.earnPoints(customerId, saved.getTotal(), saved.getId().getValue());
        } catch (Exception e) {
            log.warn("Loyalty point award skipped for order {}: {}", saved.getId().getValue(), e.getMessage());
        }

        // Notify customer — fire-and-forget, never fails the order
        try {
            String shortId = saved.getId().getValue().substring(0, 8).toUpperCase();
            sendNotificationUseCase.send(
                    customerId,
                    "ORDER_CONFIRMED",
                    "Order Confirmed",
                    "Your order #" + shortId + " has been placed successfully. Total: $" + saved.getTotal()
            );
        } catch (Exception e) {
            log.warn("Order confirmation notification skipped for order {}: {}", saved.getId().getValue(), e.getMessage());
        }

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
