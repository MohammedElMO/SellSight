package org.example.sellsight.shared.email;

import java.util.List;

/**
 * Immutable outbound email. Kept minimal so adapters for different providers
 * (Resend, SendGrid, SES) all fit. `html` is optional; `text` is required.
 */
public record EmailMessage(
        String to,
        String subject,
        String text,
        String html,
        List<Attachment> attachments
) {

    public EmailMessage(String to, String subject, String text, String html) {
        this(to, subject, text, html, List.of());
    }

    public EmailMessage {
        attachments = attachments == null ? List.of() : List.copyOf(attachments);
    }

    public static EmailMessage plain(String to, String subject, String text) {
        return new EmailMessage(to, subject, text, null);
    }

    public static EmailMessage html(String to, String subject, String text, String html) {
        return new EmailMessage(to, subject, text, html, List.of());
    }

    public EmailMessage withAttachments(List<Attachment> attachments) {
        return new EmailMessage(this.to, this.subject, this.text, this.html, attachments);
    }

    public record Attachment(String filename, String contentBase64, String contentType) {
        public Attachment {
            if (filename == null || filename.isBlank()) {
                throw new IllegalArgumentException("Attachment filename cannot be blank");
            }
            if (contentBase64 == null || contentBase64.isBlank()) {
                throw new IllegalArgumentException("Attachment content cannot be blank");
            }
        }
    }
}
