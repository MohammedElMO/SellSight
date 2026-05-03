package org.example.sellsight.user.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.application.dto.SessionDto;
import org.example.sellsight.user.application.usecase.ListMySessionsUseCase;
import org.example.sellsight.user.application.usecase.LogoutAllDevicesUseCase;
import org.example.sellsight.user.application.usecase.RevokeMySessionUseCase;
import org.example.sellsight.user.domain.model.Email;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "User Sessions")
@RestController
@RequestMapping("/api/users/me/sessions")
@RequiredArgsConstructor
public class UserSessionController {

    private final ListMySessionsUseCase listMySessionsUseCase;
    private final RevokeMySessionUseCase revokeMySessionUseCase;
    private final LogoutAllDevicesUseCase logoutAllDevicesUseCase;
    private final UserRepository userRepository;

    @Operation(operationId = "listMySessions", summary = "List my active and past sessions")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SessionDto>> listSessions(@AuthenticationPrincipal UserDetails principal) {
        String userId = resolveUserId(principal);
        return ResponseEntity.ok(listMySessionsUseCase.execute(userId));
    }

    @Operation(operationId = "revokeMySession", summary = "Revoke a specific session")
    @PostMapping("/{sessionId}/revoke")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> revokeSession(@PathVariable String sessionId,
                                               @AuthenticationPrincipal UserDetails principal) {
        String userId = resolveUserId(principal);
        revokeMySessionUseCase.execute(userId, sessionId);
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "revokeAllMySessions", summary = "Revoke all my sessions (logout all devices)")
    @PostMapping("/revoke-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> revokeAllSessions(@AuthenticationPrincipal UserDetails principal) {
        String userId = resolveUserId(principal);
        logoutAllDevicesUseCase.execute(userId);
        return ResponseEntity.noContent().build();
    }

    private String resolveUserId(UserDetails principal) {
        return userRepository.findByEmail(new Email(principal.getUsername()))
                .map(u -> u.getId().getValue())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found: " + principal.getUsername()));
    }
}
