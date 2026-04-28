package org.example.sellsight.engagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "back_in_stock_subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@IdClass(BackInStockSubscriptionJpaEntity.PK.class)
public class BackInStockSubscriptionJpaEntity {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Id
    @Column(name = "product_id")
    private String productId;

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
