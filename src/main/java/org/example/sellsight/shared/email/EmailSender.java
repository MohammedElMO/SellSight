package org.example.sellsight.shared.email;

/**
 * Outbound port for transactional email. Swap adapters via Spring profile or
 * config — LoggingEmailAdapter for dev (logs to stdout), ResendEmailAdapter
 * when a real API key is configured.
 */
public interface EmailSender {
    void send(EmailMessage message);
}
