package org.example.sellsight.event;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;

/**
 * Event emitted on user actions: product views, cart additions, wishlist, purchases.
 * Published to: user.activity topic
 * Used for analytics, recommendations, and activity feed.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserActivityEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    public enum ActivityType {
        PRODUCT_VIEW,
        CART_ADD,
        CART_REMOVE,
        WISHLIST_ADD,
        WISHLIST_REMOVE,
        PRODUCT_SEARCH,
        CATEGORY_VIEW,
        ORDER_PLACED,
        REVIEW_SUBMITTED
    }

    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("event_type")
    private ActivityType eventType;

    @JsonProperty("product_id")
    private Long productId;

    @JsonProperty("category_id")
    private Long categoryId;

    @JsonProperty("seller_id")
    private Long sellerId;

    @JsonProperty("session_id")
    private String sessionId;

    @JsonProperty("page_url")
    private String pageUrl;

    @JsonProperty("referrer")
    private String referrer;

    @JsonProperty("quantity")
    private Integer quantity; // For cart/wishlist actions

    @JsonProperty("search_query")
    private String searchQuery; // For search events

    @JsonProperty("device_type")
    private String deviceType; // e.g., "MOBILE", "DESKTOP"

    @JsonProperty("ip_address")
    private String ipAddress;

    @JsonProperty("timestamp")
    private Instant timestamp;

    @JsonProperty("duration_ms")
    private Long durationMs; // Time spent on page/product
}
