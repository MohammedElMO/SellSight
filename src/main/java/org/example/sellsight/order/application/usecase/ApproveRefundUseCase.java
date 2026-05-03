package org.example.sellsight.order.application.usecase;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Refund;
import com.stripe.param.RefundCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.order.application.dto.RefundRequestDto;
import org.example.sellsight.order.infrastructure.persistence.entity.RefundRequestJpaEntity;
import org.example.sellsight.order.infrastructure.persistence.repository.OrderJpaRepository;
import org.example.sellsight.order.infrastructure.persistence.repository.RefundRequestJpaRepository;
import org.example.sellsight.shared.realtime.RealtimePublisher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
public class ApproveRefundUseCase {

    @Value("${STRIPE_SECRET_KEY}")
    private String stripeApiKey;

    private final RefundRequestJpaRepository refundRepo;
    private final OrderJpaRepository orderRepo;
    private final RealtimePublisher realtimePublisher;

    public ApproveRefundUseCase(RefundRequestJpaRepository refundRepo,
                                OrderJpaRepository orderRepo,
                                RealtimePublisher realtimePublisher) {
        this.refundRepo = refundRepo;
        this.orderRepo = orderRepo;
        this.realtimePublisher = realtimePublisher;
    }

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    public List<RefundRequestDto> listPending() {
        return refundRepo.findAll().stream().map(this::toDto).toList();
    }

    public RefundRequestDto approve(String refundId) {
        var entity = findOrThrow(refundId);
        if (!"PENDING".equals(entity.getStatus())) {
            throw new IllegalStateException("Refund already resolved: " + entity.getStatus());
        }

        String piId = orderRepo.findById(entity.getOrderId())
                .map(o -> o.getStripePaymentIntentId())
                .orElse(null);

        if (piId != null) {
            try {
                RefundCreateParams params = RefundCreateParams.builder()
                        .setPaymentIntent(piId)
                        .build();
                Refund.create(params);
                log.info("Stripe refund issued for PI={} order={}", piId, entity.getOrderId());
            } catch (StripeException e) {
                log.error("Stripe refund failed for PI={}: {}", piId, e.getMessage());
                throw new RuntimeException("Stripe refund failed: " + e.getMessage(), e);
            }
        } else {
            log.warn("No Stripe PI found for order={}, marking APPROVED without Stripe call", entity.getOrderId());
        }

        entity.setStatus("APPROVED");
        entity.setResolvedAt(LocalDateTime.now());
        RefundRequestDto result = toDto(refundRepo.save(entity));

        // Notify the customer that their refund was approved
        try {
            realtimePublisher.pushToUser(entity.getCustomerId(), "refund-approved",
                    Map.of("refundId", refundId, "orderId", entity.getOrderId()));
        } catch (Exception e) {
            log.debug("SSE push skipped for refund-approved: {}", e.getMessage());
        }

        return result;
    }

    public RefundRequestDto reject(String refundId) {
        var entity = findOrThrow(refundId);
        if (!"PENDING".equals(entity.getStatus())) {
            throw new IllegalStateException("Refund already resolved: " + entity.getStatus());
        }
        entity.setStatus("REJECTED");
        entity.setResolvedAt(LocalDateTime.now());
        RefundRequestDto result = toDto(refundRepo.save(entity));

        // Notify the customer that their refund was rejected
        try {
            realtimePublisher.pushToUser(entity.getCustomerId(), "refund-rejected",
                    Map.of("refundId", refundId, "orderId", entity.getOrderId()));
        } catch (Exception e) {
            log.debug("SSE push skipped for refund-rejected: {}", e.getMessage());
        }

        return result;
    }

    private RefundRequestJpaEntity findOrThrow(String id) {
        return refundRepo.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("Refund request not found: " + id));
    }

    private RefundRequestDto toDto(RefundRequestJpaEntity e) {
        return new RefundRequestDto(
                e.getId().toString(), e.getOrderId(), e.getCustomerId(),
                e.getReason(), e.getStatus(), e.getCreatedAt(), e.getResolvedAt()
        );
    }
}
