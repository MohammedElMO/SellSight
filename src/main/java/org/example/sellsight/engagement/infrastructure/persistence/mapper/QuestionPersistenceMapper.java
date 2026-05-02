package org.example.sellsight.engagement.infrastructure.persistence.mapper;

import org.example.sellsight.engagement.domain.model.Question;
import org.example.sellsight.engagement.infrastructure.persistence.entity.AnswerJpaEntity;
import org.example.sellsight.engagement.infrastructure.persistence.entity.QuestionJpaEntity;
import org.mapstruct.Mapper;

import java.util.ArrayList;

@Mapper(componentModel = "spring")
public interface QuestionPersistenceMapper {

    default QuestionJpaEntity toJpa(Question question) {
        var e = new QuestionJpaEntity();
        e.setId(question.getId());
        e.setProductId(question.getProductId());
        e.setAskerId(question.getAskerId());
        e.setBody(question.getBody());
        e.setCreatedAt(question.getCreatedAt());

        var answers = question.getAnswers().stream().map(a -> {
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

    default Question toDomain(QuestionJpaEntity e) {
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
