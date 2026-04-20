package org.example.sellsight.engagement.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.sellsight.engagement.application.dto.QuestionDto;
import org.example.sellsight.engagement.application.usecase.AnswerQuestionUseCase;
import org.example.sellsight.engagement.application.usecase.AskQuestionUseCase;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.application.usecase.GetUserProfileUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Q&A", description = "Product questions and answers")
@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final AskQuestionUseCase askQuestionUseCase;
    private final AnswerQuestionUseCase answerQuestionUseCase;
    private final GetUserProfileUseCase getUserProfileUseCase;

    public QuestionController(AskQuestionUseCase askQuestionUseCase,
                               AnswerQuestionUseCase answerQuestionUseCase,
                               GetUserProfileUseCase getUserProfileUseCase) {
        this.askQuestionUseCase = askQuestionUseCase;
        this.answerQuestionUseCase = answerQuestionUseCase;
        this.getUserProfileUseCase = getUserProfileUseCase;
    }

    @Operation(operationId = "getProductQuestions", summary = "Get all questions for a product")
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<QuestionDto>> getByProduct(@PathVariable String productId) {
        return ResponseEntity.ok(askQuestionUseCase.getByProduct(productId));
    }

    @Operation(operationId = "askQuestion", summary = "Ask a question on a product",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuestionDto> ask(@RequestBody Map<String, String> body,
                                            Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        return ResponseEntity.ok(askQuestionUseCase.execute(
                body.get("productId"), user.id(), body.get("body")));
    }

    @Operation(operationId = "answerQuestion", summary = "Answer a product question",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{questionId}/answers")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuestionDto> answer(@PathVariable String questionId,
                                               @RequestBody Map<String, String> body,
                                               Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        return ResponseEntity.ok(answerQuestionUseCase.execute(
                questionId, user.id(), body.get("body")));
    }
}
