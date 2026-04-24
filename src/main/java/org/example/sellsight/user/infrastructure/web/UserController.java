package org.example.sellsight.user.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.sellsight.shared.exception.ErrorResponse;
import org.example.sellsight.user.application.dto.SellerApplicationDto;
import org.example.sellsight.user.application.dto.UpdateProfileRequest;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.application.usecase.ApproveSeller;
import org.example.sellsight.user.application.usecase.DeleteAccountUseCase;
import org.example.sellsight.user.application.usecase.GetUserProfileUseCase;
import org.example.sellsight.user.application.usecase.ListPendingSellersUseCase;
import org.example.sellsight.user.application.usecase.ListUsersUseCase;
import org.example.sellsight.user.application.usecase.RejectSeller;
import org.example.sellsight.user.application.usecase.UpdateUserProfileUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    private final ListUsersUseCase listUsersUseCase;
    private final ListPendingSellersUseCase listPendingSellersUseCase;
    private final ApproveSeller approveSeller;
    private final RejectSeller rejectSeller;

    public UserController(GetUserProfileUseCase getUserProfileUseCase,
                          UpdateUserProfileUseCase updateUserProfileUseCase,
                          DeleteAccountUseCase deleteAccountUseCase,
                          ListUsersUseCase listUsersUseCase,
                          ListPendingSellersUseCase listPendingSellersUseCase,
                          ApproveSeller approveSeller,
                          RejectSeller rejectSeller) {
        this.getUserProfileUseCase = getUserProfileUseCase;
        this.updateUserProfileUseCase = updateUserProfileUseCase;
        this.deleteAccountUseCase = deleteAccountUseCase;
        this.listUsersUseCase = listUsersUseCase;
        this.listPendingSellersUseCase = listPendingSellersUseCase;
        this.approveSeller = approveSeller;
        this.rejectSeller = rejectSeller;
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

    @Operation(
        operationId = "listAllUsers",
        summary     = "List all users (ADMIN)",
        description = "Returns all non-deleted user accounts. Requires ADMIN role.",
        security    = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Users listed",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = UserDto.class)))),
        @ApiResponse(responseCode = "403", description = "Requires ADMIN role",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> listAllUsers() {
        return ResponseEntity.ok(listUsersUseCase.execute());
    }

    @Operation(operationId = "listPendingSellers", summary = "List pending seller applications (ADMIN)",
               security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/sellers/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SellerApplicationDto>> listPendingSellers() {
        return ResponseEntity.ok(listPendingSellersUseCase.execute());
    }

    @Operation(operationId = "approveSeller", summary = "Approve a seller application (ADMIN)",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/sellers/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> approveSeller(@PathVariable String id) {
        approveSeller.execute(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "rejectSeller", summary = "Reject a seller application (ADMIN)",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/sellers/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> rejectSeller(@PathVariable String id) {
        rejectSeller.execute(id);
        return ResponseEntity.noContent().build();
    }
}
