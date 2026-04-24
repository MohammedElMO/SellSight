package org.example.sellsight.messaging.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "order_messages")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class OrderMessageJpaEntity {

    @Id
    private UUID id;

    @Column(name = "order_id", nullable = false, length = 36)
    private String orderId;

    @Column(name = "sender_id", nullable = false)
    private String senderId;

    @Column(name = "sender_role", nullable = false, length = 20)
    private String senderRole;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;
}
