package org.example.sellsight.user.application.usecase;

import org.example.sellsight.user.application.dto.UpdateProfileRequest;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.domain.model.Email;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UpdateUserProfileUseCase {

    private final UserRepository userRepository;

    public UpdateUserProfileUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDto execute(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(new Email(email))
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.updateProfile(request.firstName(), request.lastName());
        User saved = userRepository.save(user);

        return new UserDto(
                saved.getId().getValue(),
                saved.getEmail().getValue(),
                saved.getFirstName(),
                saved.getLastName(),
                saved.getRole().name(),
                saved.getCreatedAt()
        );
    }
}
