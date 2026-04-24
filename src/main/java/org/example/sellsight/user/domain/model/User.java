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
    private AuthProvider authProvider;
    private String providerId;          // null for LOCAL users
    private boolean emailVerified;
    private LocalDateTime deletedAt;    // soft delete marker (GDPR)
    private SellerStatus sellerStatus;  // null for non-SELLER roles

    /** Convenience ctor for local (email+password) CUSTOMER users. */
    public User(UserId id, String firstName, String lastName,
                Email email, Password password, Role role, LocalDateTime createdAt) {
        this(id, firstName, lastName, email, password, role, createdAt, false,
             AuthProvider.LOCAL, null, false, null, null);
    }

    public User(UserId id, String firstName, String lastName,
                Email email, Password password, Role role, LocalDateTime createdAt,
                boolean isVirtual) {
        this(id, firstName, lastName, email, password, role, createdAt, isVirtual,
             AuthProvider.LOCAL, null, false, null, null);
    }

    public User(UserId id, String firstName, String lastName,
                Email email, Password password, Role role, LocalDateTime createdAt,
                boolean isVirtual, AuthProvider authProvider, String providerId) {
        this(id, firstName, lastName, email, password, role, createdAt, isVirtual,
             authProvider, providerId,
             authProvider != AuthProvider.LOCAL, // OAuth users auto-verified
             null, null);
    }

    /** Full constructor — used by the persistence mapper when rehydrating. */
    public User(UserId id, String firstName, String lastName,
                Email email, Password password, Role role, LocalDateTime createdAt,
                boolean isVirtual, AuthProvider authProvider, String providerId,
                boolean emailVerified, LocalDateTime deletedAt, SellerStatus sellerStatus) {
        this.id = Objects.requireNonNull(id, "User ID cannot be null");
        this.email = Objects.requireNonNull(email, "Email cannot be null");
        this.role = Objects.requireNonNull(role, "Role cannot be null");
        this.createdAt = Objects.requireNonNull(createdAt, "CreatedAt cannot be null");
        this.authProvider = Objects.requireNonNull(authProvider, "AuthProvider cannot be null");
        this.isVirtual = isVirtual;
        this.providerId = providerId;
        this.emailVerified = emailVerified;
        this.deletedAt = deletedAt;
        this.sellerStatus = sellerStatus;

        if (authProvider == AuthProvider.LOCAL) {
            this.password = Objects.requireNonNull(password, "Password cannot be null for local users");
        } else {
            this.password = password;
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

    public void markEmailVerified() {
        this.emailVerified = true;
    }

    public void softDelete(LocalDateTime at) {
        this.deletedAt = Objects.requireNonNull(at, "Deletion timestamp cannot be null");
    }

    public boolean isDeleted() {
        return this.deletedAt != null;
    }

    public void markSellerPending() {
        this.sellerStatus = SellerStatus.PENDING;
    }

    public void approveAsSeller() {
        this.sellerStatus = SellerStatus.APPROVED;
    }

    public void rejectAsSeller() {
        this.sellerStatus = SellerStatus.REJECTED;
    }

    /**
     * Link this local account to an OAuth provider. Used when the same email
     * registers first via password, then later signs in via Google/Slack.
     */
    public void linkOAuth(AuthProvider provider, String providerId) {
        if (provider == AuthProvider.LOCAL) {
            throw new IllegalArgumentException("Cannot link account to LOCAL provider");
        }
        this.authProvider = provider;
        this.providerId = Objects.requireNonNull(providerId, "Provider ID cannot be null");
        this.emailVerified = true; // provider has verified the email for us
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
    public boolean isEmailVerified() { return emailVerified; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
    public SellerStatus getSellerStatus() { return sellerStatus; }
}
