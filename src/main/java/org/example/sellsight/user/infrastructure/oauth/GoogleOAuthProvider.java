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
 * Exchanges a Google authorization code for user info.
 */
@Component
public class GoogleOAuthProvider {

    private static final Logger log = LoggerFactory.getLogger(GoogleOAuthProvider.class);
    private static final ParameterizedTypeReference<Map<String, Object>> MAP_TYPE =
            new ParameterizedTypeReference<>() {};

    private final String clientId;
    private final String clientSecret;
    private final RestTemplate restTemplate = new RestTemplate();

    public GoogleOAuthProvider(
            @Value("${oauth.google.client-id:}") String clientId,
            @Value("${oauth.google.client-secret:}") String clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    @Retry(name = "outbound-http")
    @CircuitBreaker(name = "outbound-http", fallbackMethod = "exchangeCodeFallback")
    public OAuthUserInfo exchangeCodeForUser(String code, String redirectUri) {
        log.info("Google OAuth: exchanging code for token");
        log.info("  redirect_uri: {}", redirectUri);

        // 1. Exchange code for access token
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        Map<String, Object> tokenBody;
        try {
            ResponseEntity<Map<String, Object>> tokenResponse = restTemplate.exchange(
                    "https://oauth2.googleapis.com/token",
                    HttpMethod.POST,
                    new HttpEntity<>(params, headers),
                    MAP_TYPE
            );
            tokenBody = tokenResponse.getBody();
        } catch (HttpClientErrorException e) {
            String responseBody = e.getResponseBodyAsString();
            log.error("Google token exchange failed with status {}: {}", e.getStatusCode(), responseBody);
            throw new OAuthException("Google authentication failed: " + responseBody);
        }
        // RestClientException (network) propagates so @Retry can handle it

        if (tokenBody == null || !tokenBody.containsKey("access_token")) {
            String error = tokenBody != null && tokenBody.containsKey("error")
                    ? String.valueOf(tokenBody.get("error")) : "unknown";
            log.error("Google token response missing access_token. Error: {}", error);
            throw new OAuthException("Google authentication failed: " + error);
        }

        String accessToken = String.valueOf(tokenBody.get("access_token"));

        // 2. Fetch user info
        HttpHeaders authHeaders = new HttpHeaders();
        authHeaders.setBearerAuth(accessToken);

        Map<String, Object> user;
        try {
            ResponseEntity<Map<String, Object>> userResponse = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    HttpMethod.GET,
                    new HttpEntity<>(authHeaders),
                    MAP_TYPE
            );
            user = userResponse.getBody();
        } catch (HttpClientErrorException e) {
            log.error("Google userinfo fetch failed with status {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new OAuthException("Google authentication failed: could not fetch user info");
        }
        // RestClientException (network) propagates so @Retry can handle it

        if (user == null || !user.containsKey("email")) {
            throw new OAuthException("Google authentication failed: no email in user info");
        }

        String email = String.valueOf(user.get("email"));
        log.info("Google OAuth: successfully fetched user info for {}", email);

        return new OAuthUserInfo(
                String.valueOf(user.get("id")),
                email,
                user.containsKey("given_name") ? String.valueOf(user.get("given_name"))
                        : String.valueOf(user.getOrDefault("name", "User")),
                user.containsKey("family_name") ? String.valueOf(user.get("family_name")) : ""
        );
    }

    private OAuthUserInfo exchangeCodeFallback(String code, String redirectUri, Exception e) {
        log.error("Google OAuth circuit open or retries exhausted: {}", e.getMessage());
        throw new OAuthException("Google authentication is temporarily unavailable. Please try again later.");
    }
}
