package org.example.sellsight.user.application.usecase;

import org.example.sellsight.config.security.JwtService;
import org.example.sellsight.user.application.dto.AuthResponse;
import org.example.sellsight.user.application.dto.OAuthLoginRequest;
import org.example.sellsight.user.domain.model.*;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.example.sellsight.user.infrastructure.oauth.GoogleOAuthProvider;
import org.example.sellsight.user.infrastructure.oauth.OAuthUserInfo;
import org.example.sellsight.user.infrastructure.oauth.SlackOAuthProvider;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Use case: Authenticate or register a user via OAuth2.
 * Exchanges the authorization code for user info, finds or creates the user, returns JWT.
 */
@Service
public class OAuthLoginUseCase {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final GoogleOAuthProvider googleProvider;
    private final SlackOAuthProvider slackProvider;

    public OAuthLoginUseCase(UserRepository userRepository,
                              JwtService jwtService,
                              GoogleOAuthProvider googleProvider,
                              SlackOAuthProvider slackProvider) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.googleProvider = googleProvider;
        this.slackProvider = slackProvider;
    }

    public AuthResponse execute(OAuthLoginRequest request) {
        AuthProvider provider = AuthProvider.valueOf(request.provider().toUpperCase());

        OAuthUserInfo userInfo = switch (provider) {
            case GOOGLE -> googleProvider.exchangeCodeForUser(request.code(), request.redirectUri());
            case SLACK  -> slackProvider.exchangeCodeForUser(request.code(), request.redirectUri());
            default     -> throw new IllegalArgumentException("Unsupported OAuth provider: " + request.provider());
        };

        // Try to find existing user by provider+providerId
        Optional<User> existing = userRepository.findByAuthProviderAndProviderId(provider, userInfo.providerId());

        User user;
        if (existing.isPresent()) {
            user = existing.get();
        } else {
            // Check if a user with this email already exists (e.g. registered with password)
            Email email = new Email(userInfo.email());
            Optional<User> byEmail = userRepository.findByEmail(email);
            if (byEmail.isPresent()) {
                // Email already taken by a different auth method
                throw new IllegalStateException(
                        "An account with this email already exists. Please sign in with your original method.");
            }

            // Create new OAuth user (default role: CUSTOMER, no password)
            String firstName = userInfo.firstName().isBlank() ? "User" : userInfo.firstName();
            String lastName = userInfo.lastName().isBlank() ? "User" : userInfo.lastName();

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

        String token = jwtService.generateToken(user.getEmail().getValue(), user.getRole().name());

        return new AuthResponse(
                token,
                user.getEmail().getValue(),
                user.getRole().name(),
                user.getFirstName(),
                user.getLastName()
        );
    }
}
