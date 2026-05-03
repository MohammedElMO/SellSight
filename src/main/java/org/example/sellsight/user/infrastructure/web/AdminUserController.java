package org.example.sellsight.user.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.application.dto.AdminUserDto;
import org.example.sellsight.user.application.dto.AdminUserPageDto;
import org.example.sellsight.user.application.dto.ChangeRoleRequest;
import org.example.sellsight.user.application.usecase.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Admin - Users")
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final ListAdminUsersUseCase listAdminUsersUseCase;
    private final GetAdminUserUseCase getAdminUserUseCase;
    private final DisableUserUseCase disableUserUseCase;
    private final EnableUserUseCase enableUserUseCase;
    private final ChangeUserRoleUseCase changeUserRoleUseCase;
    private final AdminDeleteUserUseCase adminDeleteUserUseCase;
    private final RestoreUserUseCase restoreUserUseCase;
    private final RevokeAllUserSessionsUseCase revokeAllUserSessionsUseCase;

    @Operation(operationId = "adminListUsers", summary = "List all users (paginated + filtered)",
               security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUserPageDto> listUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "newest") String sort) {
        return ResponseEntity.ok(listAdminUsersUseCase.execute(search, role, status, page, size, sort));
    }

    @Operation(operationId = "adminGetUser", summary = "Get user details (with session count)",
               security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUserDto> getUser(@PathVariable String userId) {
        return ResponseEntity.ok(getAdminUserUseCase.execute(userId));
    }

    @Operation(operationId = "adminDisableUser", summary = "Disable user account and revoke all sessions",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{userId}/disable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> disableUser(@PathVariable String userId) {
        disableUserUseCase.execute(userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "adminEnableUser", summary = "Re-enable a disabled user account",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{userId}/enable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> enableUser(@PathVariable String userId) {
        enableUserUseCase.execute(userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "adminChangeUserRole", summary = "Change user role",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUserDto> changeRole(
            @PathVariable String userId,
            @Valid @RequestBody ChangeRoleRequest request) {
        return ResponseEntity.ok(changeUserRoleUseCase.execute(userId, request.role()));
    }

    @Operation(operationId = "adminDeleteUser", summary = "Soft-delete a user account",
               security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(
            @PathVariable String userId,
            Authentication authentication) {
        adminDeleteUserUseCase.execute(userId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "adminRestoreUser", summary = "Restore a soft-deleted user account",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{userId}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> restoreUser(@PathVariable String userId) {
        restoreUserUseCase.execute(userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "adminRevokeUserSessions", summary = "Revoke all sessions for a user",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{userId}/sessions/revoke-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> revokeAllSessions(@PathVariable String userId) {
        revokeAllUserSessionsUseCase.execute(userId);
        return ResponseEntity.noContent().build();
    }
}
