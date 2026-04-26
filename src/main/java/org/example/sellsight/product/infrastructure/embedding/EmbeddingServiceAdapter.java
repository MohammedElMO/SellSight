package org.example.sellsight.product.infrastructure.embedding;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.product.domain.port.EmbeddingPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.List;

@Slf4j
@Component
public class EmbeddingServiceAdapter implements EmbeddingPort {

    private final RestTemplate restTemplate;
    private final String serviceUrl;

    public EmbeddingServiceAdapter(
            @Value("${embedding.service.url}") String serviceUrl,
            @Value("${embedding.service.connect-timeout:2s}") Duration connectTimeout,
            @Value("${embedding.service.read-timeout:3s}") Duration readTimeout) {
        this.serviceUrl = serviceUrl == null ? "" : serviceUrl.replaceAll("/+$", "");
        this.restTemplate = createRestTemplate(connectTimeout, readTimeout);
    }

    @Override
    @SuppressWarnings("unchecked")
    public float[] embed(String text) {
        String normalizedText = text == null ? "" : text.trim();
        if (normalizedText.isEmpty()) {
            throw new IllegalArgumentException("Cannot embed blank text");
        }
        EmbedResponse response = restTemplate.postForObject(
            serviceUrl + "/embed",
            new EmbedRequest(normalizedText),
            EmbedResponse.class
        );
        if (response == null || response.embedding() == null) {
            throw new IllegalStateException("Embedding service returned null for text: " + normalizedText);
        }
        List<Double> values = response.embedding();
        float[] result = new float[values.size()];
        for (int i = 0; i < result.length; i++) {
            result[i] = values.get(i).floatValue();
        }
        return result;
    }

    private RestTemplate createRestTemplate(Duration connectTimeout, Duration readTimeout) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout((int) connectTimeout.toMillis());
        requestFactory.setReadTimeout((int) readTimeout.toMillis());
        return new RestTemplate(requestFactory);
    }

    record EmbedRequest(String text) {}
    record EmbedResponse(List<Double> embedding) {}
}
