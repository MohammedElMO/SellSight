package org.example.sellsight.analytics.infrastructure.web;

import org.example.sellsight.analytics.application.dto.CategoryTrendDto;
import org.example.sellsight.analytics.application.dto.SellerTopProductDto;
import org.example.sellsight.analytics.application.dto.UserInsightsDto;
import org.example.sellsight.user.application.usecase.GetUserProfileUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping("/v1")
public class AnalyticsController {

    private final JdbcTemplate jdbc;
    private final GetUserProfileUseCase getUserProfileUseCase;

    public AnalyticsController(JdbcTemplate jdbc, GetUserProfileUseCase getUserProfileUseCase) {
        this.jdbc = jdbc;
        this.getUserProfileUseCase = getUserProfileUseCase;
    }

    @GetMapping("/sellers/{sellerId}/analytics/top-products")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ResponseEntity<List<SellerTopProductDto>> getSellerTopProducts(
            @PathVariable String sellerId,
            @RequestParam(defaultValue = "10") int limit) {

        String sql = "SELECT p.id AS product_id, p.name, s.popularity_score, s.views, s.add_to_cart " +
                "FROM silver_products p JOIN product_scores_gold s ON p.id = s.product_id " +
                "WHERE p.seller_id = ? ORDER BY s.popularity_score DESC LIMIT ?";

        List<SellerTopProductDto> list = jdbc.query(sql, new Object[]{sellerId, limit}, new RowMapper<>() {
            @Override
            public SellerTopProductDto mapRow(ResultSet rs, int rowNum) throws SQLException {
                return new SellerTopProductDto(
                        rs.getLong("product_id"),
                        rs.getString("name"),
                        rs.getDouble("popularity_score"),
                        rs.getLong("views"),
                        rs.getLong("add_to_cart")
                );
            }
        });
        return ResponseEntity.ok(list);
    }

    @GetMapping("/admin/dashboard/category-trends")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CategoryTrendDto>> getCategoryTrends() {
        String sql = "SELECT p.category, AVG(s.popularity_score) AS avg_score, SUM(s.views) AS total_views " +
                "FROM silver_products p JOIN product_scores_gold s ON p.id = s.product_id " +
                "GROUP BY p.category ORDER BY avg_score DESC LIMIT 50";

        List<CategoryTrendDto> list = jdbc.query(sql, (rs, rowNum) -> new CategoryTrendDto(
                rs.getString("category"),
                rs.getDouble("avg_score"),
                rs.getLong("total_views")
        ));

        return ResponseEntity.ok(list);
    }

    @GetMapping("/users/me/insights")
    public ResponseEntity<UserInsightsDto> getMyInsights(Authentication authentication) {
        var profile = getUserProfileUseCase.execute(authentication.getName());
        String userId = profile.id();

        String sql = "SELECT products_views, products_carted, products_purchased, avg_rating " +
                "FROM gold_user_features WHERE user_id = ? LIMIT 1";

        UserInsightsDto dto = jdbc.query(sql, new Object[]{userId}, rs -> {
            if (!rs.next()) return new UserInsightsDto(0L, 0L, 0L, 0.0);
            return new UserInsightsDto(
                    rs.getLong("products_views"),
                    rs.getLong("products_carted"),
                    rs.getLong("products_purchased"),
                    rs.getDouble("avg_rating")
            );
        });

        return ResponseEntity.ok(dto);
    }
}
