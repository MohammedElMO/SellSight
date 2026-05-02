package org.example.sellsight.engagement.application.mapper;

import org.example.sellsight.engagement.application.dto.QuestionDto;
import org.example.sellsight.engagement.domain.model.Question;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface QuestionDtoMapper {

    @Mapping(target = "id", expression = "java(question.getId().toString())")
    @Mapping(target = "askerName", constant = "")
    @Mapping(target = "answers", expression = "java(mapAnswers(question.getAnswers()))")
    QuestionDto toDto(Question question);

    default List<QuestionDto.AnswerDto> mapAnswers(List<Question.Answer> answers) {
        return answers.stream()
                .map(a -> new QuestionDto.AnswerDto(
                        a.id().toString(), a.answererId(), "", a.body(), a.createdAt()
                ))
                .toList();
    }
}
