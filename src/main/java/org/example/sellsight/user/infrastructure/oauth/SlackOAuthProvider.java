package org.example.sellsight.user.infrastructure.oauth;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Exchanges a Slack authorization code for user info via "Sign in with Slack" (OpenID Connect).
 */
@Component
public class SlackOAuthProvider {

    private static final Logger log = LoggerFactory.getLogger(SlackOAuthProvider.class);
    private static final ParameterizedTypeReference<Map<String, Object>> MAP_TYPE =
            new ParameterizedTypeReference<>() {};

    private final String clientId;
    private final String clientSecret;
    private final RestTemplate restTemplate = new RestTemplate();

    public SlackOAuthProvider(
            @Value("${oauth.slack.client-id:}") String clientId,
            @Value("${oauth.slack.client-secret:}") String clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    @Retry(name = "outbound-http")
    @CircuitBreaker(name = "outbound-http", fallbackMethod = "exchangeCodeFallback")
    public OAuthUserInfo exchangeCodeForUser(String code, String redirectUri) {
        // 1. Exchange code for access token via openid.connect.token
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        Map<String, Object> tokenBody;
        try {
            ResponseEntity<Map<String, Object>> tokenResponse = restTemplate.exchange(
                    "https://slack.com/api/openid.connect.token",
                    HttpMethod.POST,
                    new HttpEntity<>(params, headers),
                    MAP_TYPE
            );
            tokenBody = tokenResponse.getBody();
        } catch (HttpClientErrorException e) {
            log.error("Slack token exchange failed with status {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new OAuthException("Slack authentication failed: " + e.getResponseBodyAsString());
        }
        // RestClientException (network) propagates so @Retry can handle it

        boolean ok = tokenBody != null && Boolean.TRUE.equals(tokenBody.get("ok"));
        if (!ok) {
            String error = tokenBody != null && tokenBody.containsKey("error")
                    ? String.valueOf(tokenBody.get("error")) : "unknown";
            log.error("Slack token exchange returned error: {}", error);
            throw new OAuthException("Slack authentication failed: " + error);
        }

        String accessToken = String.valueOf(tokenBody.get("access_token"));

        // 2. Fetch user identity
        HttpHeaders authHeaders = new HttpHeaders();
        authHeaders.setBearerAuth(accessToken);

        Map<String, Object> user;
        try {
            ResponseEntity<Map<String, Object>> userResponse = restTemplate.exchange(
                    "https://slack.com/api/openid.connect.userInfo",
                    HttpMethod.GET,
                    new HttpEntity<>(authHeaders),
                    MAP_TYPE
            );
            user = userResponse.getBody();
        } catch (HttpClientErrorException e) {
            log.error("Slack userInfo fetch failed with status {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new OAuthException("Slack authentication failed: could not fetch user info");
        }
        // RestClientException (network) propagates so @Retry can handle it

        boolean userOk = user != null && Boolean.TRUE.equals(user.get("ok"));
        if (!userOk) {
            String error = user != null && user.containsKey("error")
                    ? String.valueOf(user.get("error")) : "unknown";
            throw new OAuthException("Slack authentication failed: " + error);
        }

        String fullName = user.containsKey("name") ? String.valueOf(user.get("name")) : "";
        String[] parts = fullName.split(" ", 2);

        return new OAuthUserInfo(
                String.valueOf(user.get("sub")),
                String.valueOf(user.get("email")),
                user.containsKey("given_name") ? String.valueOf(user.get("given_name")) : parts[0],
                user.containsKey("family_name") ? String.valueOf(user.get("family_name"))
                        : (parts.length > 1 ? parts[1] : "")
        );
    }

    private OAuthUserInfo exchangeCodeFallback(String code, String redirectUri, Exception e) {
        log.error("Slack OAuth circuit open or retries exhausted: {}", e.getMessage());
        throw new OAuthException("Slack authentication is temporarily unavailable. Please try again later.");
    }
}
