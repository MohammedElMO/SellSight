package org.example.sellsight.user.application.usecase;

import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ListUsersUseCase {

    private final UserRepository userRepository;

    public ListUsersUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserDto> execute() {
        return userRepository.findAll().stream()
                .filter(u -> u.getDeletedAt() == null)
                .map(u -> new UserDto(
                        u.getId().getValue(),
                        u.getEmail().getValue(),
                        u.getFirstName(),
                        u.getLastName(),
                        u.getRole().name(),
                        u.getCreatedAt()
                ))
                .toList();
    }
}
