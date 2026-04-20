package org.example.sellsight.loyalty.domain.model;

public enum Tier {
    BRONZE,
    SILVER,
    GOLD;

    /** Determine tier from lifetime spend. */
    public static Tier fromLifetimeSpend(java.math.BigDecimal spend) {
        if (spend.compareTo(java.math.BigDecimal.valueOf(1000)) >= 0) return GOLD;
        if (spend.compareTo(java.math.BigDecimal.valueOf(250)) >= 0) return SILVER;
        return BRONZE;
    }
}
