package org.example.sellsight.engagement.application.dto;

import java.time.LocalDateTime;
import java.util.List;

public record QuestionDto(
        String id,
        String productId,
        String askerId,
        String askerName,
        String body,
        List<AnswerDto> answers,
        LocalDateTime createdAt
) {
    public record AnswerDto(
            String id,
            String answererId,
            String answererName,
            String body,
            LocalDateTime createdAt
    ) {}
}
