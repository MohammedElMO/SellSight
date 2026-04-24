package org.example.sellsight.user.domain.repository;

import org.example.sellsight.user.domain.model.*;

import java.util.List;
import java.util.Optional;

/**
 * Port interface — domain-level repository contract for User aggregate.
 * Implemented by the infrastructure persistence adapter.
 */
public interface UserRepository {

    User save(User user);

    Optional<User> findById(UserId id);

    Optional<User> findByEmail(Email email);

    boolean existsByEmail(Email email);

    Optional<User> findByAuthProviderAndProviderId(AuthProvider provider, String providerId);

    List<User> findAll();

    List<User> findPendingSellers();
}
