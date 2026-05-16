package org.example.sellsight.promotions.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "coupon_usages")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CouponUsageJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "coupon_id", nullable = false)
    private UUID couponId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "order_id", length = 36)
    private String orderId;

    @Column(name = "used_at", nullable = false)
    private LocalDateTime usedAt;

    public CouponUsageJpaEntity(UUID couponId, String userId, String orderId) {
        this.couponId = couponId;
        this.userId = userId;
        this.orderId = orderId;
        this.usedAt = LocalDateTime.now();
    }
}
