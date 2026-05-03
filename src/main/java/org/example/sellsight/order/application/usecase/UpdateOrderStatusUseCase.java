package org.example.sellsight.order.application.usecase;

import org.example.sellsight.engagement.application.usecase.SendNotificationUseCase;
import org.example.sellsight.inventory.domain.repository.InventoryRepository;
import org.example.sellsight.order.application.dto.OrderDto;
import org.example.sellsight.order.domain.exception.OrderNotFoundException;
import org.example.sellsight.order.domain.model.Order;
import org.example.sellsight.order.domain.model.OrderId;
import org.example.sellsight.order.domain.model.OrderStatus;
import org.example.sellsight.order.domain.repository.OrderRepository;
import org.example.sellsight.shared.exception.ForbiddenException;
import org.example.sellsight.shared.realtime.RealtimePublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Use case: Update an order's status (state machine transitions).
 * Enforces ownership: sellers can only update orders that contain their products.
 */
@Service
public class UpdateOrderStatusUseCase {

    private static final Logger log = LoggerFactory.getLogger(UpdateOrderStatusUseCase.class);

    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final SendNotificationUseCase sendNotificationUseCase;
    private final RealtimePublisher realtimePublisher;

    public UpdateOrderStatusUseCase(OrderRepository orderRepository,
                                     InventoryRepository inventoryRepository,
                                     SendNotificationUseCase sendNotificationUseCase,
                                     RealtimePublisher realtimePublisher) {
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
        this.sendNotificationUseCase = sendNotificationUseCase;
        this.realtimePublisher = realtimePublisher;
    }

    /**
     * Updates order status with ownership enforcement.
     * @param callerId   the authenticated user's ID
     * @param callerRole the authenticated user's role (SELLER or ADMIN)
     */
    public OrderDto execute(String orderId, String newStatus, String callerId, String callerRole) {
        Order order = orderRepository.findById(OrderId.from(orderId))
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        // Ownership check: sellers can only update orders containing their items
        if ("SELLER".equals(callerRole)) {
            boolean ownsItem = order.getItems().stream()
                    .anyMatch(item -> callerId.equals(item.getSellerId()));
            if (!ownsItem) {
                throw new ForbiddenException("You can only update orders containing your products");
            }
        }
        // ADMIN can update any order (supervision override)

        OrderStatus target = OrderStatus.valueOf(newStatus.toUpperCase());

        switch (target) {
            case CONFIRMED -> order.confirm();
            case SHIPPED -> order.ship();
            case DELIVERED -> order.deliver();
            case CANCELLED -> order.cancel();
            default -> throw new IllegalArgumentException("Invalid target status: " + newStatus);
        }

        Order saved = orderRepository.save(order);

        // Restore inventory when order is cancelled
        if (target == OrderStatus.CANCELLED) {
            for (var item : saved.getItems()) {
                try {
                    inventoryRepository.findByProductId(item.getProductId()).ifPresent(inv -> {
                        inv.increaseStock(item.getQuantity());
                        inventoryRepository.save(inv);
                    });
                } catch (Exception e) {
                    log.warn("Inventory restore skipped for product {} on order cancellation: {}",
                            item.getProductId(), e.getMessage());
                }
            }
        }

        String shortId = saved.getId().getValue().substring(0, 8).toUpperCase();
        String notifTitle = switch (target) {
            case SHIPPED -> "Order Shipped";
            case DELIVERED -> "Order Delivered";
            case CANCELLED -> "Order Cancelled";
            default -> null;
        };
        if (notifTitle != null) {
            String notifBody = switch (target) {
                case SHIPPED -> "Your order #" + shortId + " is on its way!";
                case DELIVERED -> "Your order #" + shortId + " has been delivered. Enjoy!";
                case CANCELLED -> "Your order #" + shortId + " has been cancelled.";
                default -> "";
            };
            try {
                sendNotificationUseCase.send(saved.getCustomerId(), target.name(), notifTitle, notifBody);
            } catch (Exception e) {
                log.warn("Status notification skipped for order {}: {}", saved.getId().getValue(), e.getMessage());
            }
        }

        OrderDto result = CreateOrderUseCase.toDto(saved);

        // Push order-status-changed SSE event to the customer
        try {
            realtimePublisher.pushToUser(saved.getCustomerId(), "order-status-changed",
                    Map.of("orderId", saved.getId().getValue(), "status", target.name()));
        } catch (Exception e) {
            log.debug("Realtime push skipped for order {}: {}", saved.getId().getValue(), e.getMessage());
        }

        return result;
    }
}
