package org.example.sellsight.engagement.domain.repository;

import org.example.sellsight.engagement.domain.model.Question;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Outbound port for product Q&A persistence. */
public interface QuestionRepository {
    Question save(Question question);
    Optional<Question> findById(UUID id);
    List<Question> findByProductId(String productId);
}
