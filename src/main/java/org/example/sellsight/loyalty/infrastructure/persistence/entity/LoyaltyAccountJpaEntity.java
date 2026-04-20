package org.example.sellsight.loyalty.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_accounts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class LoyaltyAccountJpaEntity {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(nullable = false)
    private int balance;

    @Column(name = "lifetime_spend", nullable = false)
    private BigDecimal lifetimeSpend;

    @Column(nullable = false, length = 10)
    private String tier;

    @Column(name = "referral_code", nullable = false, unique = true, length = 20)
    private String referralCode;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
