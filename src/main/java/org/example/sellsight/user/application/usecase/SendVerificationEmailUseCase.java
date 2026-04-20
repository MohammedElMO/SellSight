package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.shared.email.EmailMessage;
import org.example.sellsight.shared.email.EmailSender;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.infrastructure.persistence.entity.EmailVerificationTokenJpaEntity;
import org.example.sellsight.user.infrastructure.persistence.repository.EmailVerificationTokenJpaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Internal helper — mints a fresh verification token, persists it, and emails
 * the user a link. Called from RegisterUserUseCase and ResendVerificationUseCase.
 */
@Component
@RequiredArgsConstructor
public class SendVerificationEmailUseCase {

    private final EmailVerificationTokenJpaRepository tokenRepo;
    private final EmailSender emailSender;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${app.tokens.email-verification-ttl-minutes:1440}")
    private long ttlMinutes;

    @Transactional
    public void execute(User user) {
        tokenRepo.deleteAllByUserId(user.getId().getValue());

        UUID token = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        tokenRepo.save(EmailVerificationTokenJpaEntity.builder()
                .token(token)
                .userId(user.getId().getValue())
                .expiresAt(now.plusMinutes(ttlMinutes))
                .createdAt(now)
                .build());

        String link = baseUrl + "/verify-email?token=" + token;
        String body = "Hi " + user.getFirstName() + ",\n\n"
                + "Please confirm your email by visiting:\n" + link + "\n\n"
                + "This link expires in " + (ttlMinutes / 60) + " hours.\n\n"
                + "— SellSight";

        emailSender.send(EmailMessage.plain(user.getEmail().getValue(),
                "Verify your SellSight email", body));
    }
}
