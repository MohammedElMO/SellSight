package org.example.sellsight.order.application.usecase;

import com.stripe.model.PaymentIntent;
import com.stripe.exception.StripeException;
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
    private final GetLoyaltyAccountUseCase getLoyaltyAccountUseCase;

    public CreateOrderUseCase(OrderRepository orderRepository,
                               GetLoyaltyAccountUseCase getLoyaltyAccountUseCase) {
        this.orderRepository = orderRepository;
        this.getLoyaltyAccountUseCase = getLoyaltyAccountUseCase;
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

        // Award loyalty points — fire-and-forget, never fails the order
        try {
            getLoyaltyAccountUseCase.earnPoints(customerId, saved.getTotal(), saved.getId().getValue());
        } catch (Exception e) {
            log.warn("Loyalty point award skipped for order {}: {}", saved.getId().getValue(), e.getMessage());
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
