package org.example.sellsight.loyalty.domain.repository;

import org.example.sellsight.loyalty.domain.model.LoyaltyAccount;
import org.example.sellsight.loyalty.domain.model.LoyaltyTransaction;

import java.util.List;
import java.util.Optional;

public interface LoyaltyRepository {
    LoyaltyAccount save(LoyaltyAccount account);
    Optional<LoyaltyAccount> findByUserId(String userId);
    LoyaltyTransaction saveTransaction(LoyaltyTransaction transaction);
    List<LoyaltyTransaction> findTransactionsByUserId(String userId);
    Optional<LoyaltyAccount> findByReferralCode(String code);
}
