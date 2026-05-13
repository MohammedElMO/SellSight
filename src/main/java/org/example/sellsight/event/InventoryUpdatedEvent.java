package org.example.sellsight.event;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;

/**
 * Event emitted when inventory levels change for a product.
 * Published to: inventory.updated topic
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryUpdatedEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    @JsonProperty("product_id")
    private Long productId;

    @JsonProperty("quantity")
    private Integer quantity;

    @JsonProperty("previous_quantity")
    private Integer previousQuantity;

    @JsonProperty("seller_id")
    private Long sellerId;

    @JsonProperty("reorder_threshold")
    private Integer reorderThreshold;

    @JsonProperty("timestamp")
    private Instant timestamp;

    @JsonProperty("event_source")
    private String eventSource; // e.g., "ORDER_FULFILLED", "MANUAL_UPDATE", "REFUND"
}
