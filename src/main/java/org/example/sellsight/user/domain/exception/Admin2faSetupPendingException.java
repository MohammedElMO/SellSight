package org.example.sellsight.user.domain.exception;

public class Admin2faSetupPendingException extends RuntimeException {
    public Admin2faSetupPendingException() {
        super("2FA setup has not been approved yet. Contact your Super Admin.");
    }
}
