package org.example.sellsight.user.domain.exception;

/**
 * Thrown when a regular ADMIN attempts to manage a SUPER_ADMIN account.
 * SUPER_ADMIN accounts can only be managed through the /api/super-admin/* endpoints
 * by other SUPER_ADMIN users.
 */
public class SuperAdminProtectedException extends RuntimeException {

    private static final String DEFAULT_MESSAGE =
            "SUPER_ADMIN accounts cannot be managed by regular administrators.";

    public SuperAdminProtectedException() {
        super(DEFAULT_MESSAGE);
    }

    public SuperAdminProtectedException(String action) {
        super("Cannot " + action + " a SUPER_ADMIN account. SUPER_ADMIN accounts are managed exclusively by other super administrators.");
    }
}
