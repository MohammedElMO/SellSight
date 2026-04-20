package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.shared.events.EventPublisher;
import org.example.sellsight.user.application.event.EmailVerified;
import org.example.sellsight.user.domain.exception.InvalidTokenException;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.example.sellsight.user.infrastructure.persistence.entity.EmailVerificationTokenJpaEntity;
import org.example.sellsight.user.infrastructure.persistence.repository.EmailVerificationTokenJpaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class VerifyEmailUseCase {

    private final EmailVerificationTokenJpaRepository tokenRepo;
    private final UserRepository userRepository;
    private final EventPublisher eventPublisher;

    @Value("${app.kafka.topics.user-events:user-events}")
    private String userEventsTopic;

    @Transactional
    public void execute(String rawToken) {
        UUID token;
        try {
            token = UUID.fromString(rawToken);
        } catch (IllegalArgumentException e) {
            throw new InvalidTokenException("Malformed verification token");
        }

        EmailVerificationTokenJpaEntity entity = tokenRepo.findById(token)
                .orElseThrow(() -> new InvalidTokenException("Verification token not found"));

        if (entity.isExpired()) {
            throw new InvalidTokenException("Verification token expired or already used");
        }

        User user = userRepository.findById(UserId.from(entity.getUserId()))
                .orElseThrow(() -> new InvalidTokenException("User no longer exists"));

        user.markEmailVerified();
        userRepository.save(user);

        entity.setUsedAt(LocalDateTime.now());
        tokenRepo.save(entity);

        eventPublisher.publish(userEventsTopic,
                new EmailVerified(user.getId().getValue(), user.getEmail().getValue()));
    }
}
