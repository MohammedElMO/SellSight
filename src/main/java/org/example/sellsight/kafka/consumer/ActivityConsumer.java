package org.example.sellsight.kafka.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.event.UserActivityEvent;
import org.example.sellsight.analytics.application.usecase.RecordEventUseCase;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

/**
 * Consumer service for user activity events.
 * Listens to the user.activity topic.
 * 
 * Responsibilities:
 * - Update user behavioral analytics (views, clicks, cart additions)
 * - Feed personalized recommendation engines
 * - Update activity feed / recently viewed products
 * - Track funnel metrics (view → cart → purchase)
 * - Segment users for targeted campaigns
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityConsumer {

    private final ObjectMapper objectMapper;
    private final RecordEventUseCase recordEventUseCase;

    /**
     * Process user activity events.
     * Called when a user performs an action (view, cart add, wishlist, search, etc.).
     */
    @KafkaListener(
            topics = "user.activity",
            groupId = "sellsight-analytics-service",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void processUserActivity(
            @Payload String payload,
            @Header(KafkaHeaders.OFFSET) long offset
    ) {
        try {
            UserActivityEvent event = objectMapper.readValue(payload, UserActivityEvent.class);
            
            log.debug("Processing user activity: user_id={}, event_type={}, offset={}",
                    event.getUserId(), event.getEventType(), offset);

            // Route to appropriate handler based on event type
            switch (event.getEventType()) {
                case PRODUCT_VIEW:
                    handleProductView(event);
                    break;
                case CART_ADD:
                    handleCartAdd(event);
                    break;
                case CART_REMOVE:
                    handleCartRemove(event);
                    break;
                case WISHLIST_ADD:
                    handleWishlistAdd(event);
                    break;
                case WISHLIST_REMOVE:
                    handleWishlistRemove(event);
                    break;
                case PRODUCT_SEARCH:
                    handleProductSearch(event);
                    break;
                case CATEGORY_VIEW:
                    handleCategoryView(event);
                    break;
                case ORDER_PLACED:
                    handleOrderPlaced(event);
                    break;
                case REVIEW_SUBMITTED:
                    handleReviewSubmitted(event);
                    break;
                default:
                    log.warn("Unknown activity event type: {}", event.getEventType());
            }

            log.trace("Successfully processed user activity for user_id={}", event.getUserId());

        } catch (Exception e) {
            log.error("Error processing user activity event: {}", e.getMessage(), e);
            // TODO: Send to dead-letter topic for manual inspection
        }
    }

    /**
     * Handle product view event.
     * Update recently viewed products, track view counts for analytics.
     */
    private void handleProductView(UserActivityEvent event) {
        log.trace("Product view: user_id={}, product_id={}", event.getUserId(), event.getProductId());
        
        // TODO: Update recently viewed products in Redis cache
        // TODO: Increment product view counter
        // Record to analytics store
        try {
            if (event.getUserId() != null) {
                recordEventUseCase.execute(
                        event.getUserId(),
                        event.getProductId() == null ? null : String.valueOf(event.getProductId()),
                        org.example.sellsight.analytics.domain.model.EventType.VIEW,
                        event.getSessionId(),
                        null
                );
            }
        } catch (Exception e) {
            log.warn("Failed to record analytics event for product view: {}", e.getMessage());
        }
        // TODO: Trigger recommendation engine updates
    }

    /**
     * Handle cart add event.
     * Track funnel metric: view → cart (conversion rate indicator).
     */
    private void handleCartAdd(UserActivityEvent event) {
        log.debug("Cart add: user_id={}, product_id={}, quantity={}", 
                event.getUserId(), event.getProductId(), event.getQuantity());
        
        // TODO: Update cart in cache (if different from session-based)
        // Record funnel event (view → cart)
        try {
            if (event.getUserId() != null) {
                recordEventUseCase.execute(
                        event.getUserId(),
                        event.getProductId() == null ? null : String.valueOf(event.getProductId()),
                        org.example.sellsight.analytics.domain.model.EventType.ADD_TO_CART,
                        event.getSessionId(),
                        null
                );
            }
        } catch (Exception e) {
            log.warn("Failed to record analytics event for cart add: {}", e.getMessage());
        }
        // TODO: Track cart abandonment risk
    }

    /**
     * Handle cart removal event.
     * Track product removals to understand user interest changes.
     */
    private void handleCartRemove(UserActivityEvent event) {
        log.debug("Cart remove: user_id={}, product_id={}", event.getUserId(), event.getProductId());
        
        // Record removal event
        try {
            if (event.getUserId() != null) {
                recordEventUseCase.execute(
                        event.getUserId(),
                        event.getProductId() == null ? null : String.valueOf(event.getProductId()),
                        org.example.sellsight.analytics.domain.model.EventType.CLICK,
                        event.getSessionId(),
                        null
                );
            }
        } catch (Exception e) {
            log.warn("Failed to record analytics event for cart remove: {}", e.getMessage());
        }
    }

    /**
     * Handle wishlist addition event.
     * Track wishlist for future purchase intent and recommendations.
     */
    private void handleWishlistAdd(UserActivityEvent event) {
        log.debug("Wishlist add: user_id={}, product_id={}", event.getUserId(), event.getProductId());
        
        // Record wishlist addition event
        try {
            if (event.getUserId() != null) {
                recordEventUseCase.execute(
                        event.getUserId(),
                        event.getProductId() == null ? null : String.valueOf(event.getProductId()),
                        org.example.sellsight.analytics.domain.model.EventType.CLICK,
                        event.getSessionId(),
                        null
                );
            }
        } catch (Exception e) {
            log.warn("Failed to record analytics event for wishlist add: {}", e.getMessage());
        }
    }

    /**
     * Handle wishlist removal event.
     */
    private void handleWishlistRemove(UserActivityEvent event) {
        log.debug("Wishlist remove: user_id={}, product_id={}", event.getUserId(), event.getProductId());
        
        // Record wishlist removal event
        try {
            if (event.getUserId() != null) {
                recordEventUseCase.execute(
                        String.valueOf(event.getUserId()),
                        event.getProductId() == null ? null : String.valueOf(event.getProductId()),
                        org.example.sellsight.analytics.domain.model.EventType.CLICK,
                        event.getSessionId(),
                        null
                );
            }
        } catch (Exception e) {
            log.warn("Failed to record analytics event for wishlist remove: {}", e.getMessage());
        }
    }

    /**
     * Handle product search event.
     * Track search queries for SEO insights and recommendation optimization.
     */
    private void handleProductSearch(UserActivityEvent event) {
        log.debug("Product search: user_id={}, query={}", event.getUserId(), event.getSearchQuery());
        
        // Record search event
        try {
            if (event.getUserId() != null) {
                recordEventUseCase.execute(
                        event.getUserId(),
                        null,
                        org.example.sellsight.analytics.domain.model.EventType.CLICK,
                        event.getSessionId(),
                        null
                );
            }
        } catch (Exception e) {
            log.warn("Failed to record analytics event for search: {}", e.getMessage());
        }
    }

    /**
     * Handle category view event.
     * Track category browsing patterns.
     */
    private void handleCategoryView(UserActivityEvent event) {
        log.trace("Category view: user_id={}, category_id={}", event.getUserId(), event.getCategoryId());
        
        // Record category view event
        try {
            if (event.getUserId() != null) {
                recordEventUseCase.execute(
                        event.getUserId(),
                        null,
                        org.example.sellsight.analytics.domain.model.EventType.VIEW,
                        event.getSessionId(),
                        null
                );
            }
        } catch (Exception e) {
            log.warn("Failed to record analytics event for category view: {}", e.getMessage());
        }
    }

    /**
     * Handle order placement event.
     * High-value signal: user completed purchase.
     */
    private void handleOrderPlaced(UserActivityEvent event) {
        log.info("Order placed: user_id={}", event.getUserId());
        
        // Record purchase event for analytics
        try {
            if (event.getUserId() != null) {
                recordEventUseCase.execute(
                        event.getUserId(),
                        event.getProductId() == null ? null : String.valueOf(event.getProductId()),
                        org.example.sellsight.analytics.domain.model.EventType.PURCHASE,
                        event.getSessionId(),
                        null
                );
            }
        } catch (Exception e) {
            log.warn("Failed to record analytics event for order placed: {}", e.getMessage());
        }

        // TODO: Update user lifetime value metric
        // TODO: Trigger post-purchase recommendations
        // TODO: Flag user as active/high-intent for marketing campaigns
    }

    /**
     * Handle product review submission event.
     * Valuable UGC signal and engagement metric.
     */
    private void handleReviewSubmitted(UserActivityEvent event) {
        log.debug("Review submitted: user_id={}, product_id={}", event.getUserId(), event.getProductId());
        
        // Store review event for analytics
        try {
            if (event.getUserId() != null) {
                recordEventUseCase.execute(
                        event.getUserId(),
                        event.getProductId() == null ? null : String.valueOf(event.getProductId()),
                        org.example.sellsight.analytics.domain.model.EventType.CLICK,
                        event.getSessionId(),
                        null
                );
            }
        } catch (Exception e) {
            log.warn("Failed to record analytics event for review submitted: {}", e.getMessage());
        }

        // TODO: Update user engagement score
        // TODO: Trigger review moderation workflow
    }
}
