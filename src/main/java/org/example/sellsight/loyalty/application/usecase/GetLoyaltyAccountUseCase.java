package org.example.sellsight.loyalty.application.usecase;

import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.loyalty.application.dto.LoyaltyAccountDto;
import org.example.sellsight.loyalty.domain.model.LoyaltyAccount;
import org.example.sellsight.loyalty.domain.model.LoyaltyTransaction;
import org.example.sellsight.loyalty.domain.model.Tier;
import org.example.sellsight.loyalty.domain.repository.LoyaltyRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Get or create a loyalty account for a user.
 */
@Slf4j
@Component
public class GetLoyaltyAccountUseCase {

    private final LoyaltyRepository loyaltyRepository;

    public GetLoyaltyAccountUseCase(LoyaltyRepository loyaltyRepository) {
        this.loyaltyRepository = loyaltyRepository;
    }

    @Transactional(readOnly = true)
    public LoyaltyAccountDto execute(String userId) {
        LoyaltyAccount account = loyaltyRepository.findByUserId(userId)
                .orElseGet(() -> {
                    String code = generateReferralCode();
                    LoyaltyAccount newAccount = new LoyaltyAccount(
                            userId, 0, BigDecimal.ZERO, Tier.BRONZE,
                            code, LocalDateTime.now()
                    );
                    return loyaltyRepository.save(newAccount);
                });

        List<LoyaltyTransaction> transactions = loyaltyRepository.findTransactionsByUserId(userId);

        return toDto(account, transactions);
    }

    @Transactional
    public LoyaltyAccountDto earnPoints(String userId, BigDecimal orderTotal, String orderId) {
        LoyaltyAccount account = loyaltyRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Loyalty account not found"));

        LoyaltyTransaction tx = account.earnFromPurchase(orderTotal, orderId);
        loyaltyRepository.save(account);
        loyaltyRepository.saveTransaction(tx);

        return toDto(account, loyaltyRepository.findTransactionsByUserId(userId));
    }

    @Transactional
    public LoyaltyAccountDto redeemPoints(String userId, int points, String orderId) {
        LoyaltyAccount account = loyaltyRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Loyalty account not found"));

        LoyaltyTransaction tx = account.redeem(points, orderId);
        loyaltyRepository.save(account);
        loyaltyRepository.saveTransaction(tx);

        return toDto(account, loyaltyRepository.findTransactionsByUserId(userId));
    }

    static LoyaltyAccountDto toDto(LoyaltyAccount a, List<LoyaltyTransaction> txns) {
        return new LoyaltyAccountDto(
                a.getUserId(),
                a.getBalance(),
                a.pointsAsDollars(a.getBalance()),
                a.getLifetimeSpend(),
                a.getTier().name(),
                a.getReferralCode(),
                txns.stream().map(t -> new LoyaltyAccountDto.LoyaltyTransactionDto(
                        t.id().toString(), t.type().name(), t.points(),
                        t.description(), t.orderId(), t.createdAt()
                )).toList()
        );
    }

    private String generateReferralCode() {
        return "SS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
