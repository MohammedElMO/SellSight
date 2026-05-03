package org.example.sellsight.engagement.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.sellsight.engagement.application.dto.NotificationDto;
import org.example.sellsight.engagement.application.usecase.GetNotificationsUseCase;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.application.usecase.GetUserProfileUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Notifications", description = "In-app notification center")
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final GetNotificationsUseCase notificationsUseCase;
    private final GetUserProfileUseCase getUserProfileUseCase;

    public NotificationController(GetNotificationsUseCase notificationsUseCase,
                                   GetUserProfileUseCase getUserProfileUseCase) {
        this.notificationsUseCase = notificationsUseCase;
        this.getUserProfileUseCase = getUserProfileUseCase;
    }

    @Operation(operationId = "getNotifications", summary = "Get all notifications",
               security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationDto>> getAll(Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        return ResponseEntity.ok(notificationsUseCase.execute(user.id()));
    }

    @Operation(operationId = "getUnreadNotifications", summary = "Get unread notifications",
               security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationDto>> getUnread(Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        return ResponseEntity.ok(notificationsUseCase.getUnread(user.id()));
    }

    @Operation(operationId = "countUnreadNotifications", summary = "Count unread notifications",
               security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/unread/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> countUnread(Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        return ResponseEntity.ok(Map.of("count", notificationsUseCase.countUnread(user.id())));
    }

    @Operation(operationId = "markNotificationRead", summary = "Mark a notification as read",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markRead(@PathVariable String id, Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        notificationsUseCase.markRead(id, user.id());
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "markAllNotificationsRead", summary = "Mark all notifications as read",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAllRead(Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        notificationsUseCase.markAllRead(user.id());
        return ResponseEntity.noContent().build();
    }
}
