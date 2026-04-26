package org.example.sellsight.user.application.usecase;

import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ApproveSeller {

    private final UserRepository userRepository;
    private final SendSellerDecisionEmailUseCase sendSellerDecisionEmail;

    public ApproveSeller(UserRepository userRepository,
                         SendSellerDecisionEmailUseCase sendSellerDecisionEmail) {
        this.userRepository = userRepository;
        this.sendSellerDecisionEmail = sendSellerDecisionEmail;
    }

    @Transactional
    public void execute(String sellerId) {
        var user = userRepository.findById(UserId.from(sellerId))
                .orElseThrow(() -> new IllegalArgumentException("Seller not found: " + sellerId));
        user.approveAsSeller();
        userRepository.save(user);
        sendSellerDecisionEmail.sendApproved(user);
    }
}
