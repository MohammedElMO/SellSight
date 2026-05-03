package org.example.sellsight.order.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.order.application.dto.RefundRequestDto;
import org.example.sellsight.order.domain.exception.OrderNotFoundException;
import org.example.sellsight.order.domain.model.OrderId;
import org.example.sellsight.order.domain.repository.OrderRepository;
import org.example.sellsight.order.infrastructure.persistence.entity.RefundRequestJpaEntity;
import org.example.sellsight.order.infrastructure.persistence.repository.RefundRequestJpaRepository;
import org.example.sellsight.shared.realtime.RealtimePublisher;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
public class CreateRefundRequestUseCase {

    private final OrderRepository orderRepository;
    private final RefundRequestJpaRepository refundRequestJpaRepository;
    private final RealtimePublisher realtimePublisher;

    public CreateRefundRequestUseCase(OrderRepository orderRepository,
                                       RefundRequestJpaRepository refundRequestJpaRepository,
                                       RealtimePublisher realtimePublisher) {
        this.orderRepository = orderRepository;
        this.refundRequestJpaRepository = refundRequestJpaRepository;
        this.realtimePublisher = realtimePublisher;
    }

    public RefundRequestDto execute(String orderId, String customerId, String reason) {
        var order = orderRepository.findById(OrderId.from(orderId))
                .orElseThrow(() -> new OrderNotFoundException(orderId));
        if (!order.getCustomerId().equals(customerId)) {
            throw new IllegalArgumentException("Order does not belong to this customer");
        }
        if (!"DELIVERED".equals(order.getStatus().name())) {
            throw new IllegalStateException("Refunds can only be requested for delivered orders");
        }

        var entity = new RefundRequestJpaEntity(
                UUID.randomUUID(), orderId, customerId, reason,
                "PENDING", LocalDateTime.now(), null
        );
        var saved = refundRequestJpaRepository.save(entity);
        RefundRequestDto result = toDto(saved);

        // Notify admins about new refund request
        try {
            realtimePublisher.pushToAdmins("refund-requested",
                    Map.of("refundId", result.id(), "orderId", orderId, "customerId", customerId));
        } catch (Exception e) {
            log.debug("Admin SSE push skipped for refund-requested: {}", e.getMessage());
        }

        return result;
    }

    public RefundRequestDto getByOrderId(String orderId) {
        return refundRequestJpaRepository.findByOrderId(orderId)
                .map(this::toDto)
                .orElse(null);
    }

    private RefundRequestDto toDto(RefundRequestJpaEntity e) {
        return new RefundRequestDto(
                e.getId().toString(), e.getOrderId(), e.getCustomerId(),
                e.getReason(), e.getStatus(), e.getCreatedAt(), e.getResolvedAt()
        );
    }
}
