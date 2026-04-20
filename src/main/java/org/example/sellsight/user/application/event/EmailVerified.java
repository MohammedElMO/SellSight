package org.example.sellsight.user.application.event;

import org.example.sellsight.shared.events.DomainEvent;

public record EmailVerified(String userId, String email) implements DomainEvent {
    @Override public String eventType() { return "user.email_verified"; }
}
