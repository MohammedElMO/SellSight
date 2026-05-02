package org.example.sellsight.engagement.infrastructure.persistence.repository;

import org.example.sellsight.engagement.domain.model.Question;
import org.example.sellsight.engagement.domain.repository.QuestionRepository;
import org.example.sellsight.engagement.infrastructure.persistence.mapper.QuestionPersistenceMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class QuestionRepositoryAdapter implements QuestionRepository {

    private final QuestionJpaRepository jpa;
    private final QuestionPersistenceMapper mapper;

    public QuestionRepositoryAdapter(QuestionJpaRepository jpa, QuestionPersistenceMapper mapper) {
        this.jpa = jpa;
        this.mapper = mapper;
    }

    @Override
    public Question save(Question question) {
        return mapper.toDomain(jpa.save(mapper.toJpa(question)));
    }

    @Override
    public Optional<Question> findById(UUID id) {
        return jpa.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Question> findByProductId(String productId) {
        return jpa.findByProductIdOrderByCreatedAtDesc(productId).stream().map(mapper::toDomain).toList();
    }
}
