package org.example.sellsight.shared.email;

/**
 * Outbound port for transactional email. Swap adapters via Spring profile or
 * config — LoggingEmailAdapter for dev, and provider adapters (Resend, Brevo)
 * for production delivery.
 */
public interface EmailSender {
    void send(EmailMessage message);
}
