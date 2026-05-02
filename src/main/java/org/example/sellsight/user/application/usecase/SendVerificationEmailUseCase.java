package org.example.sellsight.user.application.usecase;

import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.example.sellsight.shared.email.EmailMessage;
import org.example.sellsight.shared.email.EmailSender;
import org.example.sellsight.shared.email.EmailTemplates;
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
@Slf4j
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
                + "- SellSight";

        String html = EmailTemplates.action(
                "Confirm your email to finish setting up SellSight.",
                "Account security",
                "Verify your email",
                EmailTemplates.paragraph("Hi " + EmailTemplates.escape(user.getFirstName()) + ",")
                        + EmailTemplates.paragraph("Confirm this email address so we can protect your account and send order updates to the right place."),
                "Verify email",
                link,
                EmailTemplates.muted("This secure link expires in " + ttlMinutes + " minutes. If you did not create a SellSight account, you can ignore this email.")
        );

        emailSender.send(EmailMessage.html(user.getEmail().getValue(),
                "Verify your SellSight email", body, html));
        log.info("Verification email dispatched to={} userId={}",
                user.getEmail().getValue(), user.getId().getValue());
    }
}
