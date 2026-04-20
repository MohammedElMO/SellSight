package org.example.sellsight.loyalty.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "loyalty_transactions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class LoyaltyTransactionJpaEntity {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(nullable = false)
    private int points;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "order_id", length = 36)
    private String orderId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
