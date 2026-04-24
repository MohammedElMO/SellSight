package org.example.sellsight.order.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.sellsight.order.domain.model.OrderStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA entity for orders table.
 */
@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderJpaEntity {

    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @Column(nullable = false, length = 36)
    private String customerId;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<OrderItemJpaEntity> items = new ArrayList<>();

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Column(name = "stripe_payment_intent_id", length = 255)
    private String stripePaymentIntentId;
}
