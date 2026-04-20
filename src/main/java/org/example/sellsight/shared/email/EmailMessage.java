package org.example.sellsight.shared.email;

/**
 * Immutable outbound email. Kept minimal so adapters for different providers
 * (Resend, SendGrid, SES) all fit. `html` is optional; `text` is required.
 */
public record EmailMessage(String to, String subject, String text, String html) {

    public static EmailMessage plain(String to, String subject, String text) {
        return new EmailMessage(to, subject, text, null);
    }
}
