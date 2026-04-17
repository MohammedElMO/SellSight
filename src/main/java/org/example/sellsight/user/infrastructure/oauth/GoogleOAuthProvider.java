package org.example.sellsight.user.infrastructure.oauth;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * Exchanges a Google authorization code for user info.
 */
@Component
public class GoogleOAuthProvider {

    private static final Logger log = LoggerFactory.getLogger(GoogleOAuthProvider.class);

    private final String clientId;
    private final String clientSecret;
    private final RestTemplate restTemplate = new RestTemplate();

    public GoogleOAuthProvider(
            @Value("${oauth.google.client-id:}") String clientId,
            @Value("${oauth.google.client-secret:}") String clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    public OAuthUserInfo exchangeCodeForUser(String code, String redirectUri) {
        // 1. Exchange code for access token
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        JsonNode tokenBody;
        try {
            ResponseEntity<JsonNode> tokenResponse = restTemplate.exchange(
                    "https://oauth2.googleapis.com/token",
                    HttpMethod.POST,
                    new HttpEntity<>(params, headers),
                    JsonNode.class
            );
            tokenBody = tokenResponse.getBody();
        } catch (RestClientException e) {
            log.error("Google token exchange failed: {}", e.getMessage());
            throw new OAuthException("Google authentication failed: could not exchange code for token");
        }

        if (tokenBody == null || !tokenBody.has("access_token")) {
            String error = tokenBody != null && tokenBody.has("error")
                    ? tokenBody.get("error").asText() : "unknown";
            log.error("Google token response missing access_token. Error: {}", error);
            throw new OAuthException("Google authentication failed: " + error);
        }

        String accessToken = tokenBody.get("access_token").asText();

        // 2. Fetch user info
        HttpHeaders authHeaders = new HttpHeaders();
        authHeaders.setBearerAuth(accessToken);

        JsonNode user;
        try {
            ResponseEntity<JsonNode> userResponse = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    HttpMethod.GET,
                    new HttpEntity<>(authHeaders),
                    JsonNode.class
            );
            user = userResponse.getBody();
        } catch (RestClientException e) {
            log.error("Google userinfo fetch failed: {}", e.getMessage());
            throw new OAuthException("Google authentication failed: could not fetch user info");
        }

        if (user == null || !user.has("email")) {
            throw new OAuthException("Google authentication failed: no email in user info");
        }

        return new OAuthUserInfo(
                user.get("id").asText(),
                user.get("email").asText(),
                user.has("given_name") ? user.get("given_name").asText() : user.get("name").asText(),
                user.has("family_name") ? user.get("family_name").asText() : ""
        );
    }
}
