package org.example.sellsight.analytics.infrastructure.persistence.repository;

import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import jakarta.persistence.TypedQuery;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.example.sellsight.analytics.domain.model.EventType;
import org.example.sellsight.order.domain.model.OrderStatus;

@Repository
public class AnalyticsQueryRepository {

    @PersistenceContext
    private EntityManager em;

    public BigDecimal sumRevenueSince(LocalDateTime since) {
        String q = "SELECT COALESCE(SUM(i.unitPrice * i.quantity), 0) FROM OrderItemJpaEntity i JOIN i.order o " +
            "WHERE o.createdAt >= :since AND o.status <> :cancelledStatus";
        TypedQuery<BigDecimal> query = em.createQuery(q, BigDecimal.class);
        query.setParameter("since", since);
        query.setParameter("cancelledStatus", OrderStatus.CANCELLED);
        return query.getSingleResult();
    }

    public Long countOrdersSince(LocalDateTime since) {
        String q = "SELECT COUNT(o) FROM OrderJpaEntity o WHERE o.createdAt >= :since";
        TypedQuery<Long> query = em.createQuery(q, Long.class);
        query.setParameter("since", since);
        return query.getSingleResult();
    }

    public Long countOrdersByStatusSince(LocalDateTime since, OrderStatus status) {
        String q = "SELECT COUNT(o) FROM OrderJpaEntity o WHERE o.createdAt >= :since AND o.status = :status";
        TypedQuery<Long> query = em.createQuery(q, Long.class);
        query.setParameter("since", since);
        query.setParameter("status", status);
        return query.getSingleResult();
    }

    public Long countDistinctActiveUsersSince(LocalDateTime since) {
        String q = "SELECT COUNT(DISTINCT e.userId) FROM org.example.sellsight.analytics.infrastructure.persistence.entity.UserEventJpaEntity e " +
                "WHERE e.timestamp >= :since";
        TypedQuery<Long> query = em.createQuery(q, Long.class);
        query.setParameter("since", since);
        return query.getSingleResult();
    }

    public Long countNewUsersSince(LocalDateTime since) {
        String q = "SELECT COUNT(u) FROM UserJpaEntity u WHERE u.createdAt >= :since AND u.deletedAt IS NULL";
        TypedQuery<Long> query = em.createQuery(q, Long.class);
        query.setParameter("since", since);
        return query.getSingleResult();
    }

    public Long countDistinctSessionsSince(LocalDateTime since) {
        String q = "SELECT COUNT(DISTINCT e.sessionId) FROM org.example.sellsight.analytics.infrastructure.persistence.entity.UserEventJpaEntity e " +
                "WHERE e.timestamp >= :since AND e.sessionId IS NOT NULL";
        TypedQuery<Long> query = em.createQuery(q, Long.class);
        query.setParameter("since", since);
        return query.getSingleResult();
    }

    public Long countEventsSince(LocalDateTime since, EventType eventType) {
        String q = "SELECT COUNT(e) FROM org.example.sellsight.analytics.infrastructure.persistence.entity.UserEventJpaEntity e " +
                "WHERE e.timestamp >= :since AND e.eventType = :eventType";
        TypedQuery<Long> query = em.createQuery(q, Long.class);
        query.setParameter("since", since);
        query.setParameter("eventType", eventType);
        return query.getSingleResult();
    }

    public List<Object[]> topConsumerRecommendations(LocalDateTime since, int limit) {
        String sql = """
                SELECT p.id,
                       p.name,
                       COUNT(*) AS total_events,
                       SUM(CASE WHEN e.event_type = 'VIEW' THEN 1 ELSE 0 END) AS view_count,
                       SUM(CASE WHEN e.event_type = 'ADD_TO_CART' THEN 1 ELSE 0 END) AS cart_count,
                       SUM(CASE WHEN e.event_type = 'PURCHASE' THEN 1 ELSE 0 END) AS purchase_count,
                       SUM(CASE
                             WHEN e.event_type = 'PURCHASE' THEN 5
                             WHEN e.event_type = 'ADD_TO_CART' THEN 3
                             WHEN e.event_type = 'VIEW' THEN 1
                             ELSE 0 END) AS score
                FROM user_events e
                JOIN products p ON p.id = e.product_id
                WHERE e.timestamp >= :since
                  AND e.product_id IS NOT NULL
                GROUP BY p.id, p.name
                ORDER BY score DESC, total_events DESC
                LIMIT :limit
                """;

        Query query = em.createNativeQuery(sql);
        query.setParameter("since", since);
        query.setParameter("limit", limit);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        return rows;
    }

    public List<Object[]> topProductsByRevenue(LocalDateTime since, int limit) {
        String q = """
                WITH sales AS (
                    SELECT i.product_id,
                           MAX(i.product_name) AS product_name,
                           COALESCE(SUM(i.quantity), 0) AS units_sold,
                           COALESCE(SUM(i.unit_price * i.quantity), 0) AS revenue
                    FROM order_items i
                    JOIN orders o ON o.id = i.order_id
                    WHERE o.created_at >= :since
                      AND o.status <> :cancelledStatus
                    GROUP BY i.product_id
                ),
                events AS (
                    SELECT e.product_id,
                           COALESCE(SUM(CASE WHEN e.event_type = 'VIEW' THEN 1 ELSE 0 END), 0) AS view_count,
                           COALESCE(SUM(CASE WHEN e.event_type = 'ADD_TO_CART' THEN 1 ELSE 0 END), 0) AS cart_count,
                           COALESCE(SUM(CASE WHEN e.event_type = 'PURCHASE' THEN 1 ELSE 0 END), 0) AS purchase_count
                    FROM user_events e
                    WHERE e.timestamp >= :since
                      AND e.product_id IS NOT NULL
                    GROUP BY e.product_id
                )
                SELECT s.product_id,
                       COALESCE(p.name, s.product_name) AS product_name,
                       p.image_url,
                       s.units_sold,
                       s.revenue,
                       COALESCE(e.view_count, 0) AS view_count,
                       COALESCE(e.cart_count, 0) AS cart_count,
                       COALESCE(e.purchase_count, 0) AS purchase_count
                FROM sales s
                LEFT JOIN products p ON p.id = s.product_id
                LEFT JOIN events e ON e.product_id = s.product_id
                ORDER BY s.revenue DESC, s.units_sold DESC
                LIMIT :limit
                """;
        Query query = em.createNativeQuery(q);
        query.setParameter("since", since);
        query.setParameter("cancelledStatus", OrderStatus.CANCELLED.name());
        query.setParameter("limit", limit);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        return rows;
    }

    public List<Object[]> historicalDailySales(int limit) {
        String sql = """
                SELECT sales_day, order_count, revenue
                FROM analytics_daily_sales
                ORDER BY sales_day DESC
                LIMIT :limit
                """;
        return safeRows(sql, limit);
    }

    public List<Object[]> historicalTopProducts(int limit) {
        String sql = """
                SELECT atp.product_id,
                       atp.product_name,
                       p.image_url,
                       atp.units_sold,
                       atp.revenue
                FROM analytics_top_products atp
                LEFT JOIN products p ON p.id = atp.product_id
                ORDER BY atp.revenue DESC, atp.units_sold DESC
                LIMIT :limit
                """;
        return safeRows(sql, limit);
    }

    public List<Object[]> historicalEventFunnel() {
        String sql = """
                SELECT event_type, event_count
                FROM analytics_event_funnel
                ORDER BY event_count DESC
                """;
        return safeRows(sql);
    }

    public List<Object[]> categorySales(int limit) {
        String sql = """
                SELECT category, order_count, units_sold, revenue
                FROM analytics_category_sales
                ORDER BY revenue DESC, units_sold DESC
                LIMIT :limit
                """;
        return safeRows(sql, limit);
    }

    public List<Object[]> sellerPerformance(int limit) {
        String sql = """
                SELECT seller_id, seller_name, product_count, order_count, units_sold, revenue
                FROM analytics_seller_performance
                ORDER BY revenue DESC, units_sold DESC
                LIMIT :limit
                """;
        return safeRows(sql, limit);
    }

    public List<Object[]> inventoryRisk(int limit) {
        String sql = """
                SELECT product_id, product_name, category, seller_id, stock_quantity, reorder_threshold, units_sold, view_count, risk_score
                FROM analytics_inventory_risk
                ORDER BY risk_score DESC, units_sold DESC, view_count DESC
                LIMIT :limit
                """;
        return safeRows(sql, limit);
    }

    public List<Object[]> monthlySales(int limit) {
        String sql = """
                SELECT sales_month, order_count, revenue
                FROM analytics_monthly_sales
                ORDER BY sales_month DESC
                LIMIT :limit
                """;
        return safeRows(sql, limit);
    }

    public List<Object[]> customerValue(int limit) {
        String sql = """
                SELECT customer_id, customer_name, email, order_count, total_spent, last_order_at
                FROM analytics_customer_value
                ORDER BY total_spent DESC, order_count DESC
                LIMIT :limit
                """;
        return safeRows(sql, limit);
    }

    public List<Object[]> sellerProductAnalytics(String sellerId, LocalDateTime since) {
        String sql = """
                SELECT p.id,
                       p.name,
                       p.image_url,
                       p.active,
                       COALESCE(SUM(CASE WHEN e.event_type = 'VIEW' THEN 1 ELSE 0 END), 0) AS view_count,
                       COALESCE(SUM(CASE WHEN e.event_type = 'ADD_TO_CART' THEN 1 ELSE 0 END), 0) AS cart_count,
                       COALESCE(SUM(CASE WHEN e.event_type = 'PURCHASE' THEN 1 ELSE 0 END), 0) AS purchase_count
                FROM products p
                LEFT JOIN user_events e ON e.product_id = p.id
                                       AND e.timestamp >= :since
                WHERE p.seller_id = :sellerId
                GROUP BY p.id, p.name, p.image_url, p.active, p.created_at
                ORDER BY purchase_count DESC, cart_count DESC, view_count DESC, p.created_at DESC
                """;

        Query query = em.createNativeQuery(sql);
        query.setParameter("sellerId", sellerId);
        query.setParameter("since", since);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        return rows;
    }

    private List<Object[]> safeRows(String sql, int limit) {
        try {
            Query query = em.createNativeQuery(sql);
            query.setParameter("limit", limit);
            @SuppressWarnings("unchecked")
            List<Object[]> rows = query.getResultList();
            return rows;
        } catch (RuntimeException ignored) {
            return List.of();
        }
    }

    private List<Object[]> safeRows(String sql) {
        try {
            Query query = em.createNativeQuery(sql);
            @SuppressWarnings("unchecked")
            List<Object[]> rows = query.getResultList();
            return rows;
        } catch (RuntimeException ignored) {
            return List.of();
        }
    }
}
