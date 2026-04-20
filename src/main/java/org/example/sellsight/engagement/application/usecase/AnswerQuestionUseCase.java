package org.example.sellsight.engagement.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.engagement.application.dto.QuestionDto;
import org.example.sellsight.engagement.domain.model.Question;
import org.example.sellsight.engagement.domain.repository.QuestionRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Add an answer to an existing product question.
 */
@Slf4j
@Component
public class AnswerQuestionUseCase {

    private final QuestionRepository questionRepository;
    private final AskQuestionUseCase askQuestionUseCase;

    public AnswerQuestionUseCase(QuestionRepository questionRepository,
                                  AskQuestionUseCase askQuestionUseCase) {
        this.questionRepository = questionRepository;
        this.askQuestionUseCase = askQuestionUseCase;
    }

    public QuestionDto execute(String questionId, String answererId, String body) {
        Question question = questionRepository.findById(UUID.fromString(questionId))
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        question.addAnswer(new Question.Answer(
                UUID.randomUUID(),
                answererId,
                body,
                LocalDateTime.now()
        ));

        Question saved = questionRepository.save(question);
        return askQuestionUseCase.toDto(saved);
    }
}
