package org.example.sellsight.loyalty.domain.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Loyalty account aggregate root — tracks points, tier, and referrals.
 * 1 point earned per $1 spent. 100 points = $1 off.
 */
public class LoyaltyAccount {

    private final String userId;
    private int balance;
    private BigDecimal lifetimeSpend;
    private Tier tier;
    private final String referralCode;
    private final LocalDateTime createdAt;

    public LoyaltyAccount(String userId, int balance, BigDecimal lifetimeSpend,
                           Tier tier, String referralCode, LocalDateTime createdAt) {
        this.userId = Objects.requireNonNull(userId);
        this.balance = balance;
        this.lifetimeSpend = lifetimeSpend != null ? lifetimeSpend : BigDecimal.ZERO;
        this.tier = tier != null ? tier : Tier.BRONZE;
        this.referralCode = Objects.requireNonNull(referralCode);
        this.createdAt = Objects.requireNonNull(createdAt);
    }

    // ── Business behaviour ──────────────────────────────────

    /** Earn points from a purchase. */
    public LoyaltyTransaction earnFromPurchase(BigDecimal orderTotal, String orderId) {
        int points = orderTotal.intValue(); // 1 pt per $1
        this.balance += points;
        this.lifetimeSpend = this.lifetimeSpend.add(orderTotal);
        this.tier = Tier.fromLifetimeSpend(this.lifetimeSpend);

        return new LoyaltyTransaction(
                UUID.randomUUID(), userId, TransactionType.EARN, points,
                "Earned from order " + orderId, orderId, LocalDateTime.now()
        );
    }

    /** Redeem points at checkout. Returns the dollar value redeemed. */
    public LoyaltyTransaction redeem(int points, String orderId) {
        if (points <= 0) throw new IllegalArgumentException("Points must be positive");
        if (points > balance) throw new IllegalStateException("Insufficient points balance");
        this.balance -= points;

        return new LoyaltyTransaction(
                UUID.randomUUID(), userId, TransactionType.REDEEM, -points,
                "Redeemed for order " + orderId, orderId, LocalDateTime.now()
        );
    }

    /** Award bonus points (e.g., referral bonus). */
    public LoyaltyTransaction awardBonus(int points, String description) {
        this.balance += points;
        return new LoyaltyTransaction(
                UUID.randomUUID(), userId, TransactionType.BONUS, points,
                description, null, LocalDateTime.now()
        );
    }

    public BigDecimal pointsAsDollars(int points) {
        return BigDecimal.valueOf(points).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
    }

    // ── Getters ─────────────────────────────────────────────

    public String getUserId() { return userId; }
    public int getBalance() { return balance; }
    public BigDecimal getLifetimeSpend() { return lifetimeSpend; }
    public Tier getTier() { return tier; }
    public String getReferralCode() { return referralCode; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
