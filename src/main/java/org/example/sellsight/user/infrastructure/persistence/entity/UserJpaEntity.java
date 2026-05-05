package org.example.sellsight.user.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.sellsight.user.domain.model.AuthProvider;
import org.example.sellsight.user.domain.model.SellerStatus;

import java.time.LocalDateTime;

/**
 * JPA entity for the users table — maps to/from domain User.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserJpaEntity {

    @Id
    @Column(length = 255, nullable = false, updatable = false)
    private String id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true)
    private String password;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private org.example.sellsight.user.domain.model.Role role;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private boolean isVirtual;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(nullable = true)
    private String providerId;

    @Column(nullable = false)
    private boolean emailVerified;

    @Column(nullable = true)
    private LocalDateTime deletedAt;

    @Column(nullable = true, length = 20)
    @Enumerated(EnumType.STRING)
    private SellerStatus sellerStatus;

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    @Column(nullable = false)
    private boolean disabled = false;

    @Column(name = "force_password_change", nullable = false)
    private boolean forcePasswordChange = false;

    @Column(name = "totp_secret", length = 256)
    private String totpSecret;

    @Column(name = "totp_enabled", nullable = false)
    private boolean totpEnabled = false;

    @Column(name = "totp_backup_codes", columnDefinition = "TEXT")
    private String totpBackupCodes;

    @Column(name = "admin_2fa_setup_required", nullable = false)
    private boolean admin2faSetupRequired = false;

    @Column(name = "admin_2fa_setup_approved", nullable = false)
    private boolean admin2faSetupApproved = false;

    @Column(name = "admin_2fa_reset_required", nullable = false)
    private boolean admin2faResetRequired = false;

    @Column(name = "failed_2fa_attempts", nullable = false)
    private int failed2faAttempts = 0;

    @Column(name = "last_2fa_verified_at")
    private LocalDateTime last2faVerifiedAt;
}
