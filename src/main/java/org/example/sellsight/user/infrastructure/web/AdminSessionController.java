package org.example.sellsight.user.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.application.dto.SessionDto;
import org.example.sellsight.user.application.usecase.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import java.util.List;

@Tag(name = "Admin - Sessions")
@RestController
@RequestMapping("/api/admin/sessions")
@RequiredArgsConstructor
public class AdminSessionController {

    private final ListAllSessionsUseCase listAllSessionsUseCase;
    private final ListUserSessionsUseCase listUserSessionsUseCase;
    private final GetSessionUseCase getSessionUseCase;
    private final RevokeSessionUseCase revokeSessionUseCase;
    private final RevokeAllUserSessionsUseCase revokeAllUserSessionsUseCase;
    private final RevokeFamilyUseCase revokeFamilyUseCase;

    @Operation(operationId = "adminListAllSessions", summary = "List all sessions across all users")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SessionDto>> listAllSessions() {
        return ResponseEntity.ok(listAllSessionsUseCase.execute());
    }

    @Operation(operationId = "adminListUserSessions", summary = "List sessions for a specific user")
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SessionDto>> listUserSessions(@PathVariable String userId) {
        return ResponseEntity.ok(listUserSessionsUseCase.execute(userId));
    }

    @Operation(operationId = "adminRevokeSession", summary = "Revoke a specific session")
    @PostMapping("/{sessionId}/revoke")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> revokeSession(@PathVariable String sessionId) {
        revokeSessionUseCase.execute(sessionId);
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "adminRevokeAllUserSessions", summary = "Revoke all sessions for a user")
    @PostMapping("/user/{userId}/revoke-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> revokeAllUserSessions(@PathVariable String userId) {
        revokeAllUserSessionsUseCase.execute(userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "adminGetSession", summary = "Get session details")
    @GetMapping("/{sessionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SessionDto> getSession(@PathVariable String sessionId) {
        return ResponseEntity.ok(getSessionUseCase.execute(sessionId));
    }

    @Operation(operationId = "adminRevokeFamilySessions", summary = "Revoke all sessions in a token family")
    @PostMapping("/families/{familyId}/revoke")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> revokeFamilySessions(@PathVariable String familyId) {
        revokeFamilyUseCase.execute(familyId);
        return ResponseEntity.noContent().build();
    }
}
