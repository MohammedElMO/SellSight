package org.example.sellsight.user.infrastructure.persistence.repository;

import jakarta.persistence.criteria.Predicate;
import org.example.sellsight.user.domain.model.Role;
import org.example.sellsight.user.infrastructure.persistence.entity.UserJpaEntity;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class UserSpec {

    private UserSpec() {}

    /**
     * Builds a Specification for the admin user listing.
     *
     * @param search   partial match on email / firstName / lastName (nullable)
     * @param role     exact role filter (nullable = all roles)
     * @param status   "active" | "disabled" | "deleted" | null (= all)
     */
    public static Specification<UserJpaEntity> forAdmin(String search, Role role, String status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("firstName")), pattern),
                        cb.like(cb.lower(root.get("lastName")), pattern)
                ));
            }

            if (role != null) {
                predicates.add(cb.equal(root.get("role"), role));
            }

            if ("deleted".equals(status)) {
                predicates.add(cb.isNotNull(root.get("deletedAt")));
            } else if ("disabled".equals(status)) {
                predicates.add(cb.isNull(root.get("deletedAt")));
                predicates.add(cb.isTrue(root.get("disabled")));
            } else if ("active".equals(status)) {
                predicates.add(cb.isNull(root.get("deletedAt")));
                predicates.add(cb.isFalse(root.get("disabled")));
            }
            // null status → include everything (no predicate added)

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
