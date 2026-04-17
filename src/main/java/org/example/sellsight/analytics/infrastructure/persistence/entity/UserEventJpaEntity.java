package org.example.sellsight.analytics.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.sellsight.analytics.domain.model.EventType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * JPA entity for the user_events table.
 *
 * Indexes on user_id and product_id are declared here so Hibernate
 * creates them on schema update — they match the SQL migration:
 *   CREATE INDEX idx_events_user    ON user_events(user_id);
 *   CREATE INDEX idx_events_product ON user_events(product_id);
 */
@Entity
@Table(
        name = "user_events",
        indexes = {
                @Index(name = "idx_events_user",    columnList = "user_id"),
                @Index(name = "idx_events_product", columnList = "product_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserEventJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false, length = 255)
    private String userId;

    @Column(name = "product_id", length = 255)
    private String productId;

    @Column(name = "event_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private EventType eventType;

    @Column(name = "session_id", length = 255)
    private String sessionId;

    @Column(precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
