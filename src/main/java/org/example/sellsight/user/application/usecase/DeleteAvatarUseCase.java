package org.example.sellsight.user.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.application.port.AvatarStoragePort;
import org.example.sellsight.user.domain.model.Email;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class DeleteAvatarUseCase {

    private final UserRepository userRepository;
    private final AvatarStoragePort avatarStorage;

    public DeleteAvatarUseCase(UserRepository userRepository,
                               AvatarStoragePort avatarStorage) {
        this.userRepository = userRepository;
        this.avatarStorage = avatarStorage;
    }

    public UserDto execute(String email) {
        User user = userRepository.findByEmail(new Email(email))
                .orElseThrow(() -> new RuntimeException("User not found"));

        String oldUrl = user.getAvatarUrl();
        user.removeAvatar();
        User saved = userRepository.save(user);
        avatarStorage.delete(oldUrl);

        return new UserDto(
                saved.getId().getValue(),
                saved.getEmail().getValue(),
                saved.getFirstName(),
                saved.getLastName(),
                saved.getRole().name(),
                saved.getCreatedAt(),
                saved.getAvatarUrl()
        );
    }
}
