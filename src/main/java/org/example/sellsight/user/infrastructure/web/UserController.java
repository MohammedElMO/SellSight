package org.example.sellsight.user.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.sellsight.shared.exception.ErrorResponse;
import org.example.sellsight.user.application.dto.UpdateProfileRequest;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.application.usecase.DeleteAccountUseCase;
import org.example.sellsight.user.application.usecase.GetUserProfileUseCase;
import org.example.sellsight.user.application.usecase.UpdateUserProfileUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authenticated user operations.
 */
@Tag(name = "Users", description = "Retrieve the authenticated user's profile")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final GetUserProfileUseCase getUserProfileUseCase;
    private final UpdateUserProfileUseCase updateUserProfileUseCase;
    private final DeleteAccountUseCase deleteAccountUseCase;

    public UserController(GetUserProfileUseCase getUserProfileUseCase,
                          UpdateUserProfileUseCase updateUserProfileUseCase,
                          DeleteAccountUseCase deleteAccountUseCase) {
        this.getUserProfileUseCase = getUserProfileUseCase;
        this.updateUserProfileUseCase = updateUserProfileUseCase;
        this.deleteAccountUseCase = deleteAccountUseCase;
    }

    @Operation(
        operationId = "getMyProfile",
        summary     = "Get my profile",
        description = "Returns full profile information for the currently authenticated user.",
        security    = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile returned",
            content = @Content(schema = @Schema(implementation = UserDto.class))),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/me")
    public ResponseEntity<UserDto> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        UserDto profile = getUserProfileUseCase.execute(email);
        return ResponseEntity.ok(profile);
    }

    @Operation(
        operationId = "updateMyProfile",
        summary     = "Update my profile",
        description = "Updates first name and last name of the currently authenticated user.",
        security    = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile updated",
            content = @Content(schema = @Schema(implementation = UserDto.class))),
        @ApiResponse(responseCode = "400", description = "Validation error",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/me")
    public ResponseEntity<UserDto> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        UserDto updated = updateUserProfileUseCase.execute(authentication.getName(), request);
        return ResponseEntity.ok(updated);
    }

    @Operation(
        operationId = "deleteMyAccount",
        summary     = "Delete my account",
        description = "Soft-deletes the authenticated user's account (GDPR compliance).",
        security    = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Account deleted"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyAccount(Authentication authentication) {
        deleteAccountUseCase.execute(authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
