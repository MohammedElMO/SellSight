package org.example.sellsight.analytics.infrastructure.persistence.repository;

import org.example.sellsight.analytics.application.dto.AnalyticsProductScoreDto;
import org.example.sellsight.analytics.application.dto.RecommendationDto;
import org.example.sellsight.analytics.application.dto.SellerAnalyticsSummaryDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class AnalyticsServingRepository {

    private final JdbcTemplate jdbcTemplate;

    public AnalyticsServingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AnalyticsProductScoreDto> findTopTrendingProducts(int limit) {
        return jdbcTemplate.query(
                """
                SELECT t.product_id,
                       p.name AS product_name,
                       t.seller_id,
                       t.category,
                       t.views_count,
                       t.clicks_count,
                       t.add_to_cart_count,
                       t.purchase_count,
                       t.revenue_30d,
                       t.score,
                       t.computed_at
                FROM product_trend_scores t
                JOIN products p ON p.id = t.product_id
                ORDER BY t.score DESC, t.purchase_count DESC, t.views_count DESC, t.product_id ASC
                LIMIT ?
                """,
                (rs, rowNum) -> new AnalyticsProductScoreDto(
                        rs.getString("product_id"),
                        rs.getString("product_name"),
                        rs.getString("seller_id"),
                        rs.getString("category"),
                        rs.getLong("views_count"),
                        rs.getLong("clicks_count"),
                        rs.getLong("add_to_cart_count"),
                        rs.getLong("purchase_count"),
                        rs.getBigDecimal("revenue_30d"),
                        rs.getBigDecimal("score"),
                        rs.getObject("computed_at", LocalDateTime.class)
                ),
                limit
        );
    }

    public Optional<SellerAnalyticsSummaryDto> findSellerSummary(String sellerId) {
        List<SellerAnalyticsSummaryDto> rows = jdbcTemplate.query(
                """
                SELECT t.seller_id,
                       COALESCE(u.first_name || ' ' || u.last_name, u.email, t.seller_id) AS seller_name,
                       t.views_count,
                       t.clicks_count,
                       t.add_to_cart_count,
                       t.purchase_count,
                       t.revenue_30d,
                       t.score,
                       t.computed_at
                FROM seller_trend_scores t
                LEFT JOIN users u ON u.id = t.seller_id
                WHERE t.seller_id = ?
                """,
                (rs, rowNum) -> new SellerAnalyticsSummaryDto(
                        rs.getString("seller_id"),
                        rs.getString("seller_name"),
                        rs.getLong("views_count"),
                        rs.getLong("clicks_count"),
                        rs.getLong("add_to_cart_count"),
                        rs.getLong("purchase_count"),
                        rs.getBigDecimal("revenue_30d"),
                        rs.getBigDecimal("score"),
                        rs.getObject("computed_at", LocalDateTime.class)
                ),
                sellerId
        );
        return rows.stream().findFirst();
    }

    public List<AnalyticsProductScoreDto> findTopProductsBySeller(String sellerId, int limit) {
        return jdbcTemplate.query(
                """
                SELECT t.product_id,
                       p.name AS product_name,
                       t.seller_id,
                       t.category,
                       t.views_count,
                       t.clicks_count,
                       t.add_to_cart_count,
                       t.purchase_count,
                       t.revenue_30d,
                       t.score,
                       t.computed_at
                FROM product_trend_scores t
                JOIN products p ON p.id = t.product_id
                WHERE t.seller_id = ?
                ORDER BY t.score DESC, t.purchase_count DESC, t.views_count DESC, t.product_id ASC
                LIMIT ?
                """,
                (rs, rowNum) -> new AnalyticsProductScoreDto(
                        rs.getString("product_id"),
                        rs.getString("product_name"),
                        rs.getString("seller_id"),
                        rs.getString("category"),
                        rs.getLong("views_count"),
                        rs.getLong("clicks_count"),
                        rs.getLong("add_to_cart_count"),
                        rs.getLong("purchase_count"),
                        rs.getBigDecimal("revenue_30d"),
                        rs.getBigDecimal("score"),
                        rs.getObject("computed_at", LocalDateTime.class)
                ),
                sellerId,
                limit
        );
    }

    public List<RecommendationDto> findRecommendationsForUser(String userId, int limit) {
        return jdbcTemplate.query(
                """
                SELECT r.product_id,
                       p.name AS product_name,
                       p.category,
                       r.reason,
                       r.score,
                       r.created_at
                FROM user_recommendations r
                JOIN products p ON p.id = r.product_id
                WHERE r.user_id = ?
                ORDER BY r.score DESC, r.created_at DESC, r.product_id ASC
                LIMIT ?
                """,
                (rs, rowNum) -> new RecommendationDto(
                        rs.getString("product_id"),
                        rs.getString("product_name"),
                        rs.getString("category"),
                        rs.getString("reason"),
                        rs.getBigDecimal("score"),
                        rs.getObject("created_at", LocalDateTime.class)
                ),
                userId,
                limit
        );
    }
}
