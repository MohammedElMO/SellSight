package org.example.sellsight.messaging.application.usecase;

import org.example.sellsight.messaging.application.dto.MessageDto;
import org.example.sellsight.messaging.domain.model.OrderMessage;
import org.example.sellsight.messaging.domain.repository.MessageRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class SendMessageUseCase {

    private final MessageRepository messageRepository;

    public SendMessageUseCase(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public MessageDto execute(String orderId, String senderId, String senderRole, String body) {
        var message = new OrderMessage(
                UUID.randomUUID(), orderId, senderId, senderRole, body, LocalDateTime.now()
        );
        var saved = messageRepository.save(message);
        return toDto(saved);
    }

    private MessageDto toDto(OrderMessage m) {
        return new MessageDto(
                m.getId().toString(), m.getOrderId(), m.getSenderId(),
                m.getSenderRole(), m.getBody(), m.getSentAt()
        );
    }
}
