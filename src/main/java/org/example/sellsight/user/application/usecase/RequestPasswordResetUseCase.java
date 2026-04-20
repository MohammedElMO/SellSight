package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.shared.email.EmailMessage;
import org.example.sellsight.shared.email.EmailSender;
import org.example.sellsight.shared.events.EventPublisher;
import org.example.sellsight.user.application.event.PasswordResetRequested;
import org.example.sellsight.user.domain.model.Email;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.example.sellsight.user.infrastructure.persistence.entity.PasswordResetTokenJpaEntity;
import org.example.sellsight.user.infrastructure.persistence.repository.PasswordResetTokenJpaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RequestPasswordResetUseCase {

    private final UserRepository userRepository;
    private final PasswordResetTokenJpaRepository tokenRepo;
    private final EmailSender emailSender;
    private final EventPublisher eventPublisher;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${app.tokens.password-reset-ttl-minutes:60}")
    private long ttlMinutes;

    @Value("${app.kafka.topics.user-events:user-events}")
    private String userEventsTopic;

    @Transactional
    public void execute(String rawEmail) {
        Optional<User> maybe = userRepository.findByEmail(new Email(rawEmail));
        if (maybe.isEmpty()) {
            return; // silent — don't leak whether the account exists
        }
        User user = maybe.get();
        if (user.isDeleted() || user.getPassword() == null) {
            return; // OAuth-only accounts can't reset local passwords
        }

        tokenRepo.deleteAllByUserId(user.getId().getValue());

        UUID token = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        tokenRepo.save(PasswordResetTokenJpaEntity.builder()
                .token(token)
                .userId(user.getId().getValue())
                .expiresAt(now.plusMinutes(ttlMinutes))
                .createdAt(now)
                .build());

        String link = baseUrl + "/reset-password?token=" + token;
        String body = "Hi " + user.getFirstName() + ",\n\n"
                + "Reset your password using this link (valid for " + ttlMinutes + " minutes):\n"
                + link + "\n\n"
                + "If you didn't request this, you can safely ignore this email.\n\n"
                + "— SellSight";

        emailSender.send(EmailMessage.plain(user.getEmail().getValue(),
                "Reset your SellSight password", body));

        eventPublisher.publish(userEventsTopic,
                new PasswordResetRequested(user.getId().getValue(), user.getEmail().getValue()));
    }
}
