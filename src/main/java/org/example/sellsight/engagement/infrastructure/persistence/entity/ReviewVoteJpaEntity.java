package org.example.sellsight.engagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "review_votes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@IdClass(ReviewVoteJpaEntity.PK.class)
public class ReviewVoteJpaEntity {

    @Id
    @Column(name = "review_id", columnDefinition = "uuid")
    private UUID reviewId;

    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(name = "helpful", nullable = false)
    private boolean helpful;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PK implements java.io.Serializable {
        private UUID reviewId;
        private String userId;
    }
}
