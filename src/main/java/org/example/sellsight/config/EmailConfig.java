package org.example.sellsight.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.sellsight.shared.email.EmailSender;
import org.example.sellsight.shared.email.infrastructure.LoggingEmailAdapter;
import org.example.sellsight.shared.email.infrastructure.ResendEmailAdapter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EmailConfig {

    @Bean
    public EmailSender emailSender(
            @Value("${resend.api-key:}") String apiKey,
            @Value("${resend.from:}") String fromAddress,
            ObjectMapper objectMapper) {
        
        if (apiKey != null && !apiKey.trim().isEmpty()) {
            return new ResendEmailAdapter(apiKey, fromAddress, objectMapper);
        }
        
        return new LoggingEmailAdapter();
    }
}
