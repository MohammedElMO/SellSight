package org.example.sellsight.shared.email.infrastructure;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.shared.email.EmailMessage;
import org.example.sellsight.shared.email.EmailSender;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Dev-mode adapter. Active when `resend.api-key` is blank.
 * Logs every outbound email instead of calling the network — keeps local
 * flows (verify email, password reset) testable without provider keys.
 */
@Slf4j
public class LoggingEmailAdapter implements EmailSender {

    @Override
    public void send(EmailMessage message) {
        log.info("[email:logging] to={} subject={}\n---\n{}\n---",
                message.to(), message.subject(), message.text());
    }
}
