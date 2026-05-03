package org.example.sellsight.user.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.config.security.TokenPairHelper;
import org.example.sellsight.user.application.dto.AuthBundle;
import org.example.sellsight.user.application.dto.OAuthLoginRequest;
import org.example.sellsight.user.domain.model.*;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.example.sellsight.user.infrastructure.oauth.GoogleOAuthProvider;
import org.example.sellsight.user.infrastructure.oauth.OAuthUserInfo;
import org.example.sellsight.user.infrastructure.oauth.SlackOAuthProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * OAuth2 authentication use case.
 *
 * Flow:
 * 1. Exchange authorization code for user info via the provider adapter.
 * 2. If a user exists with that (provider, providerId) → log them in.
 * 3. Otherwise, if a user exists with that email:
 *      - If their current provider is LOCAL, LINK the account (update provider/providerId,
 *        mark email verified). This lets a password-registered user later sign in via Google.
 *      - If their current provider is a DIFFERENT OAuth provider, we still link-and-override —
 *        rationale: the email was already verified, linking is safer than creating duplicates.
 * 4. Otherwise create a brand-new OAuth user (email_verified=true, no password).
 */
@Slf4j
@Service
public class OAuthLoginUseCase {

    private final UserRepository userRepository;
    private final TokenPairHelper tokenPairHelper;
    private final GoogleOAuthProvider googleProvider;
    private final SlackOAuthProvider slackProvider;

    public OAuthLoginUseCase(UserRepository userRepository,
                             TokenPairHelper tokenPairHelper,
                             GoogleOAuthProvider googleProvider,
                             SlackOAuthProvider slackProvider) {
        this.userRepository = userRepository;
        this.tokenPairHelper = tokenPairHelper;
        this.googleProvider = googleProvider;
        this.slackProvider = slackProvider;
    }

    @Transactional
    public AuthBundle execute(OAuthLoginRequest request, String ipAddress, String userAgent) {
        AuthProvider provider = AuthProvider.valueOf(request.provider().toUpperCase());

        OAuthUserInfo userInfo = switch (provider) {
            case GOOGLE -> googleProvider.exchangeCodeForUser(request.code(), request.redirectUri());
            case SLACK  -> slackProvider.exchangeCodeForUser(request.code(), request.redirectUri());
            default     -> throw new IllegalArgumentException("Unsupported OAuth provider: " + request.provider());
        };

        Optional<User> existingByProvider =
                userRepository.findByAuthProviderAndProviderId(provider, userInfo.providerId());

        User user;
        if (existingByProvider.isPresent()) {
            user = existingByProvider.get();
        } else {
            Email email = new Email(userInfo.email());
            Optional<User> byEmail = userRepository.findByEmail(email);

            if (byEmail.isPresent()) {
                user = byEmail.get();
                user.linkOAuth(provider, userInfo.providerId());
                user = userRepository.save(user);
            } else {
                String firstName = userInfo.firstName() == null || userInfo.firstName().isBlank()
                        ? "User" : userInfo.firstName();
                String lastName = userInfo.lastName() == null || userInfo.lastName().isBlank()
                        ? "User" : userInfo.lastName();

                user = new User(
                        UserId.generate(),
                        firstName,
                        lastName,
                        email,
                        null,
                        Role.CUSTOMER,
                        LocalDateTime.now(),
                        false,
                        provider,
                        userInfo.providerId()
                );
                user = userRepository.save(user);
            }
        }

        return tokenPairHelper.issue(user, ipAddress, userAgent);
    }
}
