package org.example.sellsight.shared.email.infrastructure;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.shared.email.EmailMessage;
import org.example.sellsight.shared.email.EmailSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Active only when a non-blank `resend.api-key` is configured. Calls the
 * Resend REST API directly — avoids pulling in a heavy SDK for one endpoint.
 */
@Slf4j
public class ResendEmailAdapter implements EmailSender {

    private static final URI ENDPOINT = URI.create("https://api.resend.com/emails");

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String fromAddress;

    public ResendEmailAdapter(@Value("${resend.api-key}") String apiKey,
                              @Value("${resend.from}") String fromAddress,
                              ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.fromAddress = fromAddress;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    @Override
    public void send(EmailMessage message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("from", fromAddress);
        body.put("to", message.to());
        body.put("subject", message.subject());
        body.put("text", message.text());
        if (message.html() != null) body.put("html", message.html());

        try {
            HttpRequest request = HttpRequest.newBuilder(ENDPOINT)
                    .timeout(Duration.ofSeconds(10))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                log.error("Resend API error {}: {}", response.statusCode(), response.body());
            }
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize email payload", e);
        } catch (Exception e) {
            log.error("Failed to send email via Resend: {}", e.getMessage());
        }
    }
}
