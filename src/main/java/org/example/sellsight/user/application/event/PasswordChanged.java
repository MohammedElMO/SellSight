package org.example.sellsight.user.application.event;

import org.example.sellsight.shared.events.DomainEvent;

public record PasswordChanged(String userId, String email) implements DomainEvent {
    @Override public String eventType() { return "user.password_changed"; }
}
