package org.example.sellsight.user.application.usecase;

import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.domain.model.Email;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

/**
 * Use case: Retrieve the authenticated user's profile.
 */
@Service
public class GetUserProfileUseCase {

    private final UserRepository userRepository;

    public GetUserProfileUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDto execute(String email) {
        User user = userRepository.findByEmail(new Email(email))
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserDto(
                user.getId().getValue(),
                user.getEmail().getValue(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
                user.getCreatedAt()
        );
    }
}
