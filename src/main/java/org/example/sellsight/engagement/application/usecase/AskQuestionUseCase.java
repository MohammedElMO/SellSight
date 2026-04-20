package org.example.sellsight.engagement.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.engagement.application.dto.QuestionDto;
import org.example.sellsight.engagement.domain.model.Question;
import org.example.sellsight.engagement.domain.repository.QuestionRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Ask a question on a product. Answers are added via AnswerQuestionUseCase.
 */
@Slf4j
@Component
public class AskQuestionUseCase {

    private final QuestionRepository questionRepository;

    public AskQuestionUseCase(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public QuestionDto execute(String productId, String askerId, String body) {
        Question question = new Question(
                UUID.randomUUID(),
                productId,
                askerId,
                body,
                List.of(),
                LocalDateTime.now()
        );
        Question saved = questionRepository.save(question);
        return toDto(saved);
    }

    public List<QuestionDto> getByProduct(String productId) {
        return questionRepository.findByProductId(productId).stream()
                .map(this::toDto)
                .toList();
    }

    QuestionDto toDto(Question q) {
        return new QuestionDto(
                q.getId().toString(),
                q.getProductId(),
                q.getAskerId(),
                "",
                q.getBody(),
                q.getAnswers().stream().map(a -> new QuestionDto.AnswerDto(
                        a.id().toString(), a.answererId(), "", a.body(), a.createdAt()
                )).toList(),
                q.getCreatedAt()
        );
    }
}
