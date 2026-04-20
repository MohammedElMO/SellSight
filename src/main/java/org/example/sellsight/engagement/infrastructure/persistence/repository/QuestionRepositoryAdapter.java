package org.example.sellsight.engagement.infrastructure.persistence.repository;

import org.example.sellsight.engagement.domain.model.Question;
import org.example.sellsight.engagement.domain.repository.QuestionRepository;
import org.example.sellsight.engagement.infrastructure.persistence.entity.AnswerJpaEntity;
import org.example.sellsight.engagement.infrastructure.persistence.entity.QuestionJpaEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class QuestionRepositoryAdapter implements QuestionRepository {

    private final QuestionJpaRepository jpa;

    public QuestionRepositoryAdapter(QuestionJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Question save(Question question) {
        var entity = toJpa(question);
        var saved = jpa.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Question> findById(UUID id) {
        return jpa.findById(id).map(this::toDomain);
    }

    @Override
    public List<Question> findByProductId(String productId) {
        return jpa.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::toDomain).toList();
    }

    private QuestionJpaEntity toJpa(Question q) {
        var e = new QuestionJpaEntity();
        e.setId(q.getId());
        e.setProductId(q.getProductId());
        e.setAskerId(q.getAskerId());
        e.setBody(q.getBody());
        e.setCreatedAt(q.getCreatedAt());

        var answers = q.getAnswers().stream().map(a -> {
            var ae = new AnswerJpaEntity();
            ae.setId(a.id());
            ae.setQuestion(e);
            ae.setAnswererId(a.answererId());
            ae.setBody(a.body());
            ae.setCreatedAt(a.createdAt());
            return ae;
        }).toList();
        e.setAnswers(new ArrayList<>(answers));
        return e;
    }

    private Question toDomain(QuestionJpaEntity e) {
        var answers = e.getAnswers().stream()
                .map(a -> new Question.Answer(a.getId(), a.getAnswererId(), a.getBody(), a.getCreatedAt()))
                .toList();
        return new Question(
                e.getId(),
                e.getProductId(),
                e.getAskerId(),
                e.getBody(),
                answers,
                e.getCreatedAt()
        );
    }
}
