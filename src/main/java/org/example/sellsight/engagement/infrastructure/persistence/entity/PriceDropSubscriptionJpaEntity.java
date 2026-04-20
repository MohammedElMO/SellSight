package org.example.sellsight.engagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_drop_subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@IdClass(PriceDropSubscriptionJpaEntity.PK.class)
public class PriceDropSubscriptionJpaEntity {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Id
    @Column(name = "product_id")
    private String productId;

    @Column(name = "target_price", nullable = false)
    private BigDecimal targetPrice;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PK implements java.io.Serializable {
        private String userId;
        private String productId;
    }
}
