package org.example.sellsight.user.application.usecase;

import lombok.RequiredArgsConstructor;
import org.example.sellsight.shared.email.EmailMessage;
import org.example.sellsight.shared.email.EmailSender;
import org.example.sellsight.user.domain.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
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

        String html = """
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
                  <p>Hi %s,</p>
                  <p>Great news. Your seller account has been approved.</p>
                  <p>
                    <a href="%s" style="display:inline-block;padding:12px 18px;background:#0f766e;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600">
                      Open SellSight
                    </a>
                  </p>
                  <p>You can now sign in and start selling.</p>
                  <p style="color:#6b7280">- SellSight</p>
                </div>
                """.formatted(user.getFirstName(), appLink);

        emailSender.send(new EmailMessage(user.getEmail().getValue(), subject, text, html));
    }

    public void sendRejected(User user) {
        String applyAgainLink = appUrl("/register?role=SELLER");
        String subject = "Update on your SellSight seller application";
        String text = "Hi " + user.getFirstName() + ",\n\n"
                + "Your seller application was not approved this time.\n\n"
                + "Apply again here:\n" + applyAgainLink + "\n\n"
                + "You are welcome to submit a new application.\n\n"
                + "- SellSight";

        String html = """
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
                  <p>Hi %s,</p>
                  <p>Your seller application was not approved this time.</p>
                  <p>
                    <a href="%s" style="display:inline-block;padding:12px 18px;background:#b45309;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600">
                      Apply Again
                    </a>
                  </p>
                  <p>You are welcome to submit a new application.</p>
                  <p style="color:#6b7280">- SellSight</p>
                </div>
                """.formatted(user.getFirstName(), applyAgainLink);

        emailSender.send(new EmailMessage(user.getEmail().getValue(), subject, text, html));
    }

    private String appUrl(String path) {
        String normalizedBase = baseUrl.endsWith("/")
                ? baseUrl.substring(0, baseUrl.length() - 1)
                : baseUrl;
        return normalizedBase + path;
    }
}
