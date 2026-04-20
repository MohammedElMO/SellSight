package org.example.sellsight.engagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "wishlist_items")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class WishlistItemJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wishlist_id", nullable = false)
    private WishlistJpaEntity wishlist;

    @Column(name = "product_id", nullable = false)
    private String productId;

    @Column(name = "added_at", nullable = false)
    private LocalDateTime addedAt;
}
