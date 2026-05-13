package org.example.sellsight.event;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Event emitted when a new order is created.
 * Published to: order.created topic
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreatedEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    @JsonProperty("order_id")
    private Long orderId;

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("seller_ids")
    private List<Long> sellerIds;

    @JsonProperty("total_amount")
    private BigDecimal totalAmount;

    @JsonProperty("item_count")
    private Integer itemCount;

    @JsonProperty("status")
    private String status; // e.g., "PENDING", "CONFIRMED"

    @JsonProperty("payment_method")
    private String paymentMethod; // e.g., "STRIPE", "PAYPAL"

    @JsonProperty("shipping_address_id")
    private Long shippingAddressId;

    @JsonProperty("timestamp")
    private Instant timestamp;

    @JsonProperty("items")
    private List<OrderItemDetail> items;

    /**
     * Nested object for order items
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemDetail implements Serializable {

        private static final long serialVersionUID = 1L;

        @JsonProperty("product_id")
        private Long productId;

        @JsonProperty("quantity")
        private Integer quantity;

        @JsonProperty("unit_price")
        private BigDecimal unitPrice;

        @JsonProperty("seller_id")
        private Long sellerId;
    }
}
