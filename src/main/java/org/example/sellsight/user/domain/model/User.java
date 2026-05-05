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
    private String avatarUrl;           // Cloudinary secure_url, nullable
    private boolean disabled;           // admin-initiated suspension
    private String totpSecret;          // base32 TOTP secret, null until setup
    private boolean totpEnabled;        // true once admin confirmed 2FA setup
    private String totpBackupCodes;     // comma-separated SHA-256 hashed backup codes

    // Admin 2FA state machine fields
    private boolean admin2faSetupRequired;  // must complete 2FA setup before dashboard access
    private boolean admin2faSetupApproved;  // SUPER_ADMIN approved the setup
    private boolean admin2faResetRequired;  // SUPER_ADMIN triggered reset
    private int failed2faAttempts;          // consecutive failed TOTP verifications
    private LocalDateTime last2faVerifiedAt; // last successful 2FA verification
    private boolean forcePasswordChange;    // must change temp password before 2FA setup (bootstrap)

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
        if (newRole != Role.SELLER) {
            this.sellerStatus = null;
        } else if (this.sellerStatus == null) {
            this.sellerStatus = SellerStatus.PENDING;
        }
        // Promote to privileged role → require 2FA setup (auto-approved at promotion time)
        if (newRole == Role.ADMIN || newRole == Role.SUPER_ADMIN) {
            if (!this.totpEnabled) {
                this.admin2faSetupRequired = true;
                this.admin2faSetupApproved = true;
            }
        } else {
            // Demoted away from admin → clear 2FA admin flags
            this.admin2faSetupRequired = false;
            this.admin2faSetupApproved = false;
            this.admin2faResetRequired = false;
        }
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

    public void restore() {
        this.deletedAt = null;
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

    public void disable() {
        this.disabled = true;
    }

    public void enable() {
        this.disabled = false;
    }

    public boolean isDisabled() {
        return this.disabled;
    }

    public void changeAvatar(String url) {
        this.avatarUrl = url;
    }

    public void removeAvatar() {
        this.avatarUrl = null;
    }

    public void setupTotpPending(String secret) {
        this.totpSecret = Objects.requireNonNull(secret, "TOTP secret cannot be null");
        this.totpEnabled = false;
    }

    public void activateTotp(String backupCodesHashed) {
        if (this.totpSecret == null) throw new IllegalStateException("TOTP setup not initiated");
        this.totpEnabled = true;
        this.totpBackupCodes = backupCodesHashed;
    }

    public void disableTotp() {
        this.totpSecret = null;
        this.totpEnabled = false;
        this.totpBackupCodes = null;
    }

    public void consumeBackupCode(String updatedBackupCodesHashed) {
        this.totpBackupCodes = updatedBackupCodesHashed;
    }

    /** Used by persistence mapper to rehydrate 2FA state. */
    public void rehydrateTotp(String secret, boolean enabled, String backupCodes) {
        this.totpSecret = secret;
        this.totpEnabled = enabled;
        this.totpBackupCodes = backupCodes;
    }

    // ── Admin 2FA state machine ────────────────────────────────

    /** Mark that this admin must complete 2FA setup before dashboard access. */
    public void requireAdmin2faSetup() {
        this.admin2faSetupRequired = true;
        this.admin2faSetupApproved = false;
    }

    /** SUPER_ADMIN approves a pending 2FA setup request. */
    public void approveAdmin2faSetup() {
        this.admin2faSetupApproved = true;
    }

    /** Called after successful 2FA setup — clears setup requirement. */
    public void completeAdmin2faSetup() {
        this.admin2faSetupRequired = false;
        this.admin2faSetupApproved = false;
        this.admin2faResetRequired = false;
        this.failed2faAttempts = 0;
    }

    /** SUPER_ADMIN resets an admin's 2FA — disables TOTP, forces re-setup. */
    public void resetAdmin2fa() {
        disableTotp();
        this.admin2faSetupRequired = true;
        this.admin2faSetupApproved = false;
        this.admin2faResetRequired = true;
    }

    /** SUPER_ADMIN approves a reset (same as approve setup). */
    public void approveAdmin2faReset() {
        this.admin2faSetupApproved = true;
    }

    public void recordFailed2faAttempt() {
        this.failed2faAttempts++;
    }

    public void resetFailed2faAttempts() {
        this.failed2faAttempts = 0;
    }

    public void record2faVerified() {
        this.last2faVerifiedAt = LocalDateTime.now();
        this.failed2faAttempts = 0;
    }

    public void requirePasswordChange() {
        this.forcePasswordChange = true;
    }

    public void clearForcePasswordChange() {
        this.forcePasswordChange = false;
    }

    public boolean isForcePasswordChange() {
        return forcePasswordChange;
    }

    /** Used by persistence mapper to rehydrate admin 2FA state fields. */
    public void rehydrateAdmin2faFlags(boolean setupRequired, boolean setupApproved,
                                        boolean resetRequired, int failedAttempts,
                                        LocalDateTime lastVerified, boolean forcePasswordChange) {
        this.admin2faSetupRequired = setupRequired;
        this.admin2faSetupApproved = setupApproved;
        this.admin2faResetRequired = resetRequired;
        this.failed2faAttempts = failedAttempts;
        this.last2faVerifiedAt = lastVerified;
        this.forcePasswordChange = forcePasswordChange;
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
    public String getAvatarUrl() { return avatarUrl; }
    public boolean getDisabled() { return disabled; }
    public String getTotpSecret() { return totpSecret; }
    public boolean isTotpEnabled() { return totpEnabled; }
    public String getTotpBackupCodes() { return totpBackupCodes; }
    public boolean isAdmin2faSetupRequired() { return admin2faSetupRequired; }
    public boolean isAdmin2faSetupApproved() { return admin2faSetupApproved; }
    public boolean isAdmin2faResetRequired() { return admin2faResetRequired; }
    public int getFailed2faAttempts() { return failed2faAttempts; }
    public LocalDateTime getLast2faVerifiedAt() { return last2faVerifiedAt; }
    // forcePasswordChange getter is defined above alongside its mutators
}
