package org.example.sellsight.user.application.event;

import org.example.sellsight.shared.events.DomainEvent;

public record UserRegistered(String userId, String email, String role) implements DomainEvent {
    @Override public String eventType() { return "user.registered"; }
}
