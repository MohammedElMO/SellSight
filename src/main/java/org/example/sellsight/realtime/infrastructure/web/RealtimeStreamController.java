package org.example.sellsight.realtime.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.sellsight.engagement.application.usecase.GetNotificationsUseCase;
import org.example.sellsight.realtime.infrastructure.SseEmitterRegistry;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.application.usecase.GetUserProfileUseCase;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

@Tag(name = "Realtime", description = "Server-Sent Events streams")
@RestController
@RequestMapping("/api/realtime")
public class RealtimeStreamController {

    private final SseEmitterRegistry registry;
    private final GetUserProfileUseCase getUserProfileUseCase;
    private final GetNotificationsUseCase notificationsUseCase;

    public RealtimeStreamController(SseEmitterRegistry registry,
                                    GetUserProfileUseCase getUserProfileUseCase,
                                    GetNotificationsUseCase notificationsUseCase) {
        this.registry = registry;
        this.getUserProfileUseCase = getUserProfileUseCase;
        this.notificationsUseCase = notificationsUseCase;
    }

    /**
     * SSE stream for authenticated users (all roles).
     * Events: notification, order-status-changed, new-order (sellers), admin-event (admins).
     * Auth: app_token HttpOnly cookie — the JWT filter sets SecurityContext before this runs.
     */
    @Operation(operationId = "realtimeStream", summary = "SSE stream for realtime events",
               security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("isAuthenticated()")
    public SseEmitter stream(Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        String role = user.role();

        SseEmitter emitter = registry.register(user.id(), role);

        // Send initial unread count so client updates badge immediately
        try {
            long unread = notificationsUseCase.countUnread(user.id());
            emitter.send(SseEmitter.event().name("unread-count").data(unread));
        } catch (IOException e) {
            emitter.completeWithError(e);
        }

        return emitter;
    }
}
