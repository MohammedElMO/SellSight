package org.example.sellsight.engagement.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Question on a product listing. Contains zero or more answers.
 */
public class Question {

    private final UUID id;
    private final String productId;
    private final String askerId;
    private final String body;
    private final List<Answer> answers;
    private final LocalDateTime createdAt;

    public Question(UUID id, String productId, String askerId, String body,
                    List<Answer> answers, LocalDateTime createdAt) {
        this.id = Objects.requireNonNull(id);
        this.productId = Objects.requireNonNull(productId);
        this.askerId = Objects.requireNonNull(askerId);
        if (body == null || body.isBlank()) {
            throw new IllegalArgumentException("Question body cannot be empty");
        }
        this.body = body.trim();
        this.answers = new ArrayList<>(answers != null ? answers : List.of());
        this.createdAt = Objects.requireNonNull(createdAt);
    }

    public void addAnswer(Answer answer) {
        this.answers.add(Objects.requireNonNull(answer));
    }

    // ── Getters ─────────────────────────────────────────────

    public UUID getId() { return id; }
    public String getProductId() { return productId; }
    public String getAskerId() { return askerId; }
    public String getBody() { return body; }
    public List<Answer> getAnswers() { return Collections.unmodifiableList(answers); }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public record Answer(UUID id, String answererId, String body, LocalDateTime createdAt) {
        public Answer {
            Objects.requireNonNull(id);
            Objects.requireNonNull(answererId);
            if (body == null || body.isBlank()) {
                throw new IllegalArgumentException("Answer body cannot be empty");
            }
        }
    }
}
