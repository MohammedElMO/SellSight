package org.example.sellsight.shared.email.infrastructure;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.shared.email.EmailMessage;
import org.example.sellsight.shared.email.EmailSender;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
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
    @Retry(name = "outbound-http")
    @CircuitBreaker(name = "outbound-http", fallbackMethod = "sendFallback")
    public void send(EmailMessage message) {
        log.info("Sending email via Resend to={} subject=\"{}\" attachments={}",
                message.to(), message.subject(), message.attachments().size());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("from", fromAddress);
        body.put("to", message.to());
        body.put("subject", message.subject());
        body.put("text", message.text());
        if (message.html() != null) body.put("html", message.html());
        if (!message.attachments().isEmpty()) {
            body.put("attachments", message.attachments().stream()
                    .map(a -> {
                        Map<String, Object> item = new LinkedHashMap<>();
                        item.put("filename", a.filename());
                        item.put("content", a.contentBase64());
                        if (a.contentType() != null && !a.contentType().isBlank()) {
                            item.put("content_type", a.contentType());
                        }
                        return item;
                    })
                    .toList());
        }

        String json;
        try {
            json = objectMapper.writeValueAsString(body);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize email payload for {}", message.to(), e);
            return;
        }

        HttpRequest request = HttpRequest.newBuilder(ENDPOINT)
                .timeout(Duration.ofSeconds(10))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .header("User-Agent", "SellSight/1.0")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                log.error("Resend API error {}: {}", response.statusCode(), response.body());
            } else {
                log.info("Resend email accepted to={} subject=\"{}\" status={} response={}",
                        message.to(), message.subject(), response.statusCode(), response.body());
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Email send interrupted for {}", message.to());
            throw new RuntimeException("Email send interrupted", e);
        } catch (IOException e) {
            throw new RuntimeException("Email send I/O failure", e);
        }
        // IOException propagates to let @Retry handle transient network failures
    }

    private void sendFallback(EmailMessage message, Exception e) {
        log.error("Email delivery failed after retries for {} ({}): {}",
                message.to(), message.subject(), e.getMessage());
    }
}
