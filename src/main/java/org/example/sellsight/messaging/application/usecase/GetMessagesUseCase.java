package org.example.sellsight.messaging.application.usecase;

import org.example.sellsight.messaging.application.dto.MessageDto;
import org.example.sellsight.messaging.domain.repository.MessageRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GetMessagesUseCase {

    private final MessageRepository messageRepository;

    public GetMessagesUseCase(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public List<MessageDto> execute(String orderId) {
        return messageRepository.findByOrderId(orderId).stream()
                .map(m -> new MessageDto(
                        m.getId().toString(), m.getOrderId(), m.getSenderId(),
                        m.getSenderRole(), m.getBody(), m.getSentAt()))
                .toList();
    }
}
