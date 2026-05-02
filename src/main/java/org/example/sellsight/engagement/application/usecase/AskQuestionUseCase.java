package org.example.sellsight.engagement.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.engagement.application.dto.QuestionDto;
import org.example.sellsight.engagement.application.mapper.QuestionDtoMapper;
import org.example.sellsight.engagement.domain.model.Question;
import org.example.sellsight.engagement.domain.repository.QuestionRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
public class AskQuestionUseCase {

    private final QuestionRepository questionRepository;
    private final QuestionDtoMapper questionDtoMapper;

    public AskQuestionUseCase(QuestionRepository questionRepository, QuestionDtoMapper questionDtoMapper) {
        this.questionRepository = questionRepository;
        this.questionDtoMapper = questionDtoMapper;
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
        return questionDtoMapper.toDto(questionRepository.save(question));
    }

    public List<QuestionDto> getByProduct(String productId) {
        return questionRepository.findByProductId(productId).stream()
                .map(questionDtoMapper::toDto)
                .toList();
    }

    QuestionDto toDto(Question q) {
        return questionDtoMapper.toDto(q);
    }
}
