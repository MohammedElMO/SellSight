package org.example.sellsight.user.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.application.port.AvatarStoragePort;
import org.example.sellsight.user.domain.model.Email;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Set;

/**
 * Upload (or replace) the avatar of the authenticated user.
 *
 * Validation rules (defense-in-depth — frontend also validates):
 *   - max 5 MB
 *   - MIME must be image/jpeg, image/png, or image/webp
 */
@Slf4j
@Service
public class UploadAvatarUseCase {

    public static final long MAX_BYTES = 5L * 1024 * 1024;
    public static final Set<String> ALLOWED_MIME = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );

    private final UserRepository userRepository;
    private final AvatarStoragePort avatarStorage;

    public UploadAvatarUseCase(UserRepository userRepository,
                               AvatarStoragePort avatarStorage) {
        this.userRepository = userRepository;
        this.avatarStorage = avatarStorage;
    }

    public UserDto execute(String email, byte[] bytes, String contentType) {
        if (bytes == null || bytes.length == 0) {
            throw new IllegalArgumentException("Avatar file is empty");
        }
        if (bytes.length > MAX_BYTES) {
            throw new IllegalArgumentException("Avatar file exceeds 5MB limit");
        }
        String mime = contentType == null ? "" : contentType.toLowerCase();
        if (!ALLOWED_MIME.contains(mime)) {
            throw new IllegalArgumentException(
                    "Unsupported image type. Allowed: JPEG, PNG, WebP");
        }

        User user = userRepository.findByEmail(new Email(email))
                .orElseThrow(() -> new RuntimeException("User not found"));

        String url = avatarStorage.upload(user.getId().getValue(), bytes, mime);
        user.changeAvatar(url);
        User saved = userRepository.save(user);

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
