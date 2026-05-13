package org.example.sellsight.event;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;

/**
 * Event emitted when an order is fulfilled or its status changes.
 * Published to: order.fulfilled topic
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderFulfilledEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    @JsonProperty("order_id")
    private Long orderId;

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("status")
    private String status; // e.g., "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"

    @JsonProperty("previous_status")
    private String previousStatus;

    @JsonProperty("seller_id")
    private Long sellerId;

    @JsonProperty("tracking_number")
    private String trackingNumber;

    @JsonProperty("shipped_at")
    private Instant shippedAt;

    @JsonProperty("delivered_at")
    private Instant deliveredAt;

    @JsonProperty("timestamp")
    private Instant timestamp;

    @JsonProperty("reason")
    private String reason; // For cancellations/refunds
}
