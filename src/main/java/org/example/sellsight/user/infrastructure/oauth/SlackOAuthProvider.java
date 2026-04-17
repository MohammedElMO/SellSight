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
 * Exchanges a Slack authorization code for user info via "Sign in with Slack" (OpenID Connect).
 */
@Component
public class SlackOAuthProvider {

    private static final Logger log = LoggerFactory.getLogger(SlackOAuthProvider.class);

    private final String clientId;
    private final String clientSecret;
    private final RestTemplate restTemplate = new RestTemplate();

    public SlackOAuthProvider(
            @Value("${oauth.slack.client-id:}") String clientId,
            @Value("${oauth.slack.client-secret:}") String clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    public OAuthUserInfo exchangeCodeForUser(String code, String redirectUri) {
        // 1. Exchange code for access token via openid.connect.token
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        JsonNode tokenBody;
        try {
            ResponseEntity<JsonNode> tokenResponse = restTemplate.exchange(
                    "https://slack.com/api/openid.connect.token",
                    HttpMethod.POST,
                    new HttpEntity<>(params, headers),
                    JsonNode.class
            );
            tokenBody = tokenResponse.getBody();
        } catch (RestClientException e) {
            log.error("Slack token exchange failed: {}", e.getMessage());
            throw new OAuthException("Slack authentication failed: could not exchange code for token");
        }

        if (tokenBody == null || !tokenBody.has("ok") || !tokenBody.get("ok").asBoolean()) {
            String error = tokenBody != null && tokenBody.has("error")
                    ? tokenBody.get("error").asText() : "unknown";
            log.error("Slack token exchange returned error: {}", error);
            throw new OAuthException("Slack authentication failed: " + error);
        }

        String accessToken = tokenBody.get("access_token").asText();

        // 2. Fetch user identity
        HttpHeaders authHeaders = new HttpHeaders();
        authHeaders.setBearerAuth(accessToken);

        JsonNode user;
        try {
            ResponseEntity<JsonNode> userResponse = restTemplate.exchange(
                    "https://slack.com/api/openid.connect.userInfo",
                    HttpMethod.GET,
                    new HttpEntity<>(authHeaders),
                    JsonNode.class
            );
            user = userResponse.getBody();
        } catch (RestClientException e) {
            log.error("Slack userInfo fetch failed: {}", e.getMessage());
            throw new OAuthException("Slack authentication failed: could not fetch user info");
        }

        if (user == null || !user.has("ok") || !user.get("ok").asBoolean()) {
            String error = user != null && user.has("error") ? user.get("error").asText() : "unknown";
            throw new OAuthException("Slack authentication failed: " + error);
        }

        String fullName = user.has("name") ? user.get("name").asText() : "";
        String[] parts = fullName.split(" ", 2);

        return new OAuthUserInfo(
                user.get("sub").asText(),
                user.get("email").asText(),
                user.has("given_name") ? user.get("given_name").asText() : parts[0],
                user.has("family_name") ? user.get("family_name").asText() : (parts.length > 1 ? parts[1] : "")
        );
    }
}
