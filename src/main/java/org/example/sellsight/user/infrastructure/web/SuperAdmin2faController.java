package org.example.sellsight.user.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.application.dto.AdminManagementDto;
import org.example.sellsight.user.application.usecase.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Super Admin — Admin Management", description = "SUPER_ADMIN: manage admins and their 2FA")
@RestController
@RequestMapping("/api/super-admin")
@RequiredArgsConstructor
public class SuperAdmin2faController {

    private final ListAdminsUseCase listAdminsUseCase;
    private final Force2faSetupOnAdminUseCase force2faSetupOnAdminUseCase;
    private final Reset2faForAdminUseCase reset2faForAdminUseCase;
    private final Approve2faSetupUseCase approve2faSetupUseCase;
    private final DisableUserUseCase disableUserUseCase;
    private final EnableUserUseCase enableUserUseCase;
    private final RevokeAllUserSessionsUseCase revokeAllUserSessionsUseCase;
    private final Reset2faAttemptsUseCase reset2faAttemptsUseCase;

    @Operation(operationId = "listAdmins", summary = "List all ADMIN and SUPER_ADMIN accounts with 2FA status")
    @GetMapping("/admins")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<AdminManagementDto>> listAdmins() {
        return ResponseEntity.ok(listAdminsUseCase.execute());
    }

    @Operation(operationId = "force2faSetup", summary = "Force 2FA setup on an admin — revokes sessions, disables old TOTP, requires re-setup")
    @PostMapping("/admins/{userId}/force-2fa-setup")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> force2faSetup(@PathVariable String userId) {
        force2faSetupOnAdminUseCase.execute(userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "reset2faForAdmin", summary = "Reset 2FA for an admin — disables TOTP, requires new setup")
    @PostMapping("/admins/{userId}/reset-2fa")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> reset2fa(@PathVariable String userId) {
        reset2faForAdminUseCase.execute(userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "approve2faSetup", summary = "Approve a pending 2FA setup for an admin")
    @PostMapping("/admins/{userId}/approve-2fa-setup")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> approve2faSetup(@PathVariable String userId) {
        approve2faSetupUseCase.execute(userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "superAdminDisableAdmin", summary = "Disable an admin account + revoke sessions")
    @PostMapping("/admins/{userId}/disable")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> disableAdmin(@PathVariable String userId) {
        disableUserUseCase.execute(userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "superAdminEnableAdmin", summary = "Enable a disabled admin account")
    @PostMapping("/admins/{userId}/enable")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> enableAdmin(@PathVariable String userId) {
        enableUserUseCase.execute(userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "superAdminRevokeSessions", summary = "Revoke all sessions for an admin")
    @PostMapping("/admins/{userId}/revoke-sessions")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> revokeSessions(@PathVariable String userId) {
        revokeAllUserSessionsUseCase.execute(userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "reset2faAttempts", summary = "Unlock an admin locked by failed 2FA attempts")
    @PostMapping("/admins/{userId}/reset-2fa-attempts")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> reset2faAttempts(@PathVariable String userId) {
        reset2faAttemptsUseCase.execute(userId);
        return ResponseEntity.noContent().build();
    }
}
