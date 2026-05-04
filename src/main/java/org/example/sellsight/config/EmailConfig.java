package org.example.sellsight.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.sellsight.shared.email.EmailSender;
import org.example.sellsight.shared.email.infrastructure.LoggingEmailAdapter;
import org.example.sellsight.shared.email.infrastructure.ResendEmailAdapter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class EmailConfig {

    @Bean
    public EmailSender emailSender(
            @Value("${resend.api-key:}") String apiKey,
            @Value("${resend.from:noreply@sellsights.com}") String fromAddress,
            ObjectMapper objectMapper) {

        if (apiKey != null && !apiKey.trim().isEmpty()) {
            log.info("Email provider: Resend (from={})", fromAddress);
            return new ResendEmailAdapter(apiKey, fromAddress, objectMapper);
        }
        log.info("Email provider: Logging (no RESEND_API_KEY configured)");
        return new LoggingEmailAdapter();
    }
}
