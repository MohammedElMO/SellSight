package org.example.sellsight.messaging.domain.model;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

public class OrderMessage {

    private final UUID id;
    private final String orderId;
    private final String senderId;
    private final String senderRole;
    private final String body;
    private final LocalDateTime sentAt;

    public OrderMessage(UUID id, String orderId, String senderId,
                        String senderRole, String body, LocalDateTime sentAt) {
        this.id         = Objects.requireNonNull(id);
        this.orderId    = Objects.requireNonNull(orderId);
        this.senderId   = Objects.requireNonNull(senderId);
        this.senderRole = Objects.requireNonNull(senderRole);
        this.body       = Objects.requireNonNull(body);
        this.sentAt     = Objects.requireNonNull(sentAt);
        if (body.isBlank()) throw new IllegalArgumentException("Message body cannot be blank");
    }

    public UUID          getId()         { return id; }
    public String        getOrderId()    { return orderId; }
    public String        getSenderId()   { return senderId; }
    public String        getSenderRole() { return senderRole; }
    public String        getBody()       { return body; }
    public LocalDateTime getSentAt()     { return sentAt; }
}
