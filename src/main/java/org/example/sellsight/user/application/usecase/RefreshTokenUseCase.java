package org.example.sellsight.user.application.usecase;

import org.example.sellsight.config.security.JwtService;
import org.example.sellsight.user.application.dto.AuthResponse;
import org.example.sellsight.user.domain.model.Email;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class RefreshTokenUseCase {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public RefreshTokenUseCase(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public AuthResponse execute(String email) {
        User user = userRepository.findByEmail(new Email(email))
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        String sellerStatusStr = user.getSellerStatus() != null ? user.getSellerStatus().name() : null;
        String token = jwtService.generateToken(
                user.getEmail().getValue(),
                user.getRole().name(),
                user.isEmailVerified(),
                sellerStatusStr
        );

        return new AuthResponse(
                token,
                user.getEmail().getValue(),
                user.getRole().name(),
                user.getFirstName(),
                user.getLastName(),
                user.isEmailVerified(),
                sellerStatusStr
        );
    }
}
