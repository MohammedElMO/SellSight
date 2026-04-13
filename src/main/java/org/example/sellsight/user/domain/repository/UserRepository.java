package org.example.sellsight.user.domain.repository;

import org.example.sellsight.user.domain.model.Email;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.model.UserId;

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
}
