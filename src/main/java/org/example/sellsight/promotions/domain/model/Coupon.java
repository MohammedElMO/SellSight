package org.example.sellsight.promotions.domain.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Coupon aggregate root — encapsulates all validation logic for applying
 * discount codes at checkout.
 */
public class Coupon {

    private final UUID id;
    private final String code;
    private final CouponType type;
    private final BigDecimal value;
    private final BigDecimal minOrder;
    private final Integer maxUses; // null = unlimited
    private int usedCount;
    private final LocalDateTime startsAt;
    private final LocalDateTime expiresAt;
    private boolean active;

    public Coupon(UUID id, String code, CouponType type, BigDecimal value,
                  BigDecimal minOrder, Integer maxUses, int usedCount,
                  LocalDateTime startsAt, LocalDateTime expiresAt, boolean active) {
        this.id = Objects.requireNonNull(id);
        this.code = Objects.requireNonNull(code).toUpperCase().trim();
        this.type = Objects.requireNonNull(type);
        this.value = Objects.requireNonNull(value);
        this.minOrder = minOrder != null ? minOrder : BigDecimal.ZERO;
        this.maxUses = maxUses;
        this.usedCount = usedCount;
        this.startsAt = Objects.requireNonNull(startsAt);
        this.expiresAt = Objects.requireNonNull(expiresAt);
        this.active = active;

        if (value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Coupon value must be positive");
        }
        if (expiresAt.isBefore(startsAt)) {
            throw new IllegalArgumentException("Expiry must be after start");
        }
    }

    /** Check if the coupon is valid right now for the given order total. */
    public void validate(BigDecimal orderTotal) {
        if (!active) throw new IllegalStateException("Coupon is deactivated");
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(startsAt)) throw new IllegalStateException("Coupon is not yet active");
        if (now.isAfter(expiresAt)) throw new IllegalStateException("Coupon has expired");
        if (maxUses != null && usedCount >= maxUses) throw new IllegalStateException("Coupon usage limit reached");
        if (orderTotal.compareTo(minOrder) < 0) {
            throw new IllegalStateException("Order total must be at least " + minOrder);
        }
    }

    /** Calculate the discount amount for the given subtotal. */
    public BigDecimal calculateDiscount(BigDecimal subtotal) {
        return switch (type) {
            case PERCENTAGE -> subtotal.multiply(value)
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            case FIXED_AMOUNT -> value.min(subtotal);
        };
    }

    public void recordUsage() {
        this.usedCount++;
    }

    public void deactivate() { this.active = false; }
    public void activate()   { this.active = true; }

    // ── Getters ─────────────────────────────────────────────
    public UUID getId() { return id; }
    public String getCode() { return code; }
    public CouponType getType() { return type; }
    public BigDecimal getValue() { return value; }
    public BigDecimal getMinOrder() { return minOrder; }
    public Integer getMaxUses() { return maxUses; }
    public int getUsedCount() { return usedCount; }
    public LocalDateTime getStartsAt() { return startsAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public boolean isActive() { return active; }
}
