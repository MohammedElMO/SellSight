package org.example.sellsight.user.application.usecase;

import org.example.sellsight.user.application.dto.SellerApplicationDto;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ListPendingSellersUseCase {

    private final UserRepository userRepository;

    public ListPendingSellersUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<SellerApplicationDto> execute() {
        return userRepository.findPendingSellers().stream()
                .map(u -> new SellerApplicationDto(
                        u.getId().getValue(),
                        u.getEmail().getValue(),
                        u.getFirstName(),
                        u.getLastName(),
                        u.getSellerStatus() != null ? u.getSellerStatus().name() : null,
                        u.getCreatedAt()
                ))
                .toList();
    }
}
