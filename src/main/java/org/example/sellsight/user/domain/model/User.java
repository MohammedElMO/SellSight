package org.example.sellsight.user.domain.model;

import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * User aggregate root — rich domain model with behavior.
 * Pure Java, no framework annotations.
 */
@EqualsAndHashCode
public class User {

    private final UserId id;
    private String firstName;
    private String lastName;
    private final Email email;
    private Password password;          // null for OAuth users
    private Role role;
    private final LocalDateTime createdAt;
    private final boolean isVirtual;
    private final AuthProvider authProvider;
    private final String providerId;    // null for LOCAL users

    /** Constructor for real (non-virtual), LOCAL users — backwards compatible. */
    public User(UserId id, String firstName, String lastName,
                Email email, Password password, Role role, LocalDateTime createdAt) {
        this(id, firstName, lastName, email, password, role, createdAt, false,
             AuthProvider.LOCAL, null);
    }

    /** Constructor with isVirtual flag — backwards compatible. */
    public User(UserId id, String firstName, String lastName,
                Email email, Password password, Role role, LocalDateTime createdAt,
                boolean isVirtual) {
        this(id, firstName, lastName, email, password, role, createdAt, isVirtual,
             AuthProvider.LOCAL, null);
    }

    /** Full constructor — used when rehydrating from persistence or creating OAuth users. */
    public User(UserId id, String firstName, String lastName,
                Email email, Password password, Role role, LocalDateTime createdAt,
                boolean isVirtual, AuthProvider authProvider, String providerId) {
        this.id = Objects.requireNonNull(id, "User ID cannot be null");
        this.email = Objects.requireNonNull(email, "Email cannot be null");
        this.role = Objects.requireNonNull(role, "Role cannot be null");
        this.createdAt = Objects.requireNonNull(createdAt, "CreatedAt cannot be null");
        this.authProvider = Objects.requireNonNull(authProvider, "AuthProvider cannot be null");
        this.isVirtual = isVirtual;
        this.providerId = providerId;

        // Password is required for LOCAL users, optional for OAuth users
        if (authProvider == AuthProvider.LOCAL) {
            this.password = Objects.requireNonNull(password, "Password cannot be null for local users");
        } else {
            this.password = password; // may be null
        }

        setFirstName(firstName);
        setLastName(lastName);
    }


    public void updateProfile(String firstName, String lastName) {
        setFirstName(firstName);
        setLastName(lastName);
    }


    public void changeRole(Role newRole) {
        this.role = Objects.requireNonNull(newRole, "New role cannot be null");
    }


    public void changePassword(Password newPassword) {
        this.password = Objects.requireNonNull(newPassword, "New password cannot be null");
    }


    private void setFirstName(String firstName) {
        if (firstName == null || firstName.isBlank()) {
            throw new IllegalArgumentException("First name cannot be empty");
        }
        this.firstName = firstName.trim();
    }

    private void setLastName(String lastName) {
        if (lastName == null || lastName.isBlank()) {
            throw new IllegalArgumentException("Last name cannot be empty");
        }
        this.lastName = lastName.trim();
    }


    public UserId getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public Email getEmail() { return email; }
    public Password getPassword() { return password; }
    public Role getRole() { return role; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public boolean isVirtual() { return isVirtual; }
    public AuthProvider getAuthProvider() { return authProvider; }
    public String getProviderId() { return providerId; }
}
