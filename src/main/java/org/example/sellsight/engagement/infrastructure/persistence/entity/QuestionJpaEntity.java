package org.example.sellsight.engagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "product_questions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class QuestionJpaEntity {

    @Id
    private UUID id;

    @Column(name = "product_id", nullable = false)
    private String productId;

    @Column(name = "asker_id", nullable = false)
    private String askerId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<AnswerJpaEntity> answers = new ArrayList<>();
}
