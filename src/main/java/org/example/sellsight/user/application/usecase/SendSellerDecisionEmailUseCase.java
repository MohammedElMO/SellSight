package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.shared.email.EmailMessage;
import org.example.sellsight.shared.email.EmailSender;
import org.example.sellsight.shared.email.EmailTemplates;
import org.example.sellsight.user.domain.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class SendSellerDecisionEmailUseCase {

    private final EmailSender emailSender;

    @Value("${app.base-url}")
    private String baseUrl;

    public void sendApproved(User user) {
        String appLink = appUrl("/");
        String subject = "Welcome to SellSight Seller";
        String text = "Hi " + user.getFirstName() + ",\n\n"
                + "Great news. Your seller account has been approved.\n\n"
                + "Open SellSight:\n" + appLink + "\n\n"
                + "You can now sign in and start selling.\n\n"
                + "- SellSight";

        String html = EmailTemplates.action(
                "Your SellSight seller account is approved.",
                "Seller approval",
                "You are ready to sell",
                EmailTemplates.paragraph("Hi " + EmailTemplates.escape(user.getFirstName()) + ",")
                        + EmailTemplates.paragraph("Your seller account has been approved. You can now sign in, list products, and start managing your storefront."),
                "Open SellSight",
                appLink,
                EmailTemplates.muted("Thanks for helping make SellSight a better marketplace.")
        );

        emailSender.send(new EmailMessage(user.getEmail().getValue(), subject, text, html));
        log.info("Seller approval email dispatched to={} userId={}",
                user.getEmail().getValue(), user.getId().getValue());
    }

    public void sendRejected(User user) {
        String applyAgainLink = appUrl("/register?role=SELLER");
        String subject = "Update on your SellSight seller application";
        String text = "Hi " + user.getFirstName() + ",\n\n"
                + "Your seller application was not approved this time.\n\n"
                + "Apply again here:\n" + applyAgainLink + "\n\n"
                + "You are welcome to submit a new application.\n\n"
                + "- SellSight";

        String html = EmailTemplates.action(
                "An update on your SellSight seller application.",
                "Application update",
                "Seller application update",
                EmailTemplates.paragraph("Hi " + EmailTemplates.escape(user.getFirstName()) + ",")
                        + EmailTemplates.paragraph("Your seller application was not approved this time. You are welcome to review your details and submit a new application."),
                "Apply again",
                applyAgainLink,
                EmailTemplates.muted("Thanks for your interest in selling on SellSight.")
        );

        emailSender.send(new EmailMessage(user.getEmail().getValue(), subject, text, html));
        log.info("Seller rejection email dispatched to={} userId={}",
                user.getEmail().getValue(), user.getId().getValue());
    }

    private String appUrl(String path) {
        String normalizedBase = baseUrl.endsWith("/")
                ? baseUrl.substring(0, baseUrl.length() - 1)
                : baseUrl;
        return normalizedBase + path;
    }
}
