package org.example.sellsight.user.domain.exception;

public class TwoFactorLockedException extends RuntimeException {
    public TwoFactorLockedException() {
        super("Too many failed 2FA attempts. Contact your Super Admin to unlock your account.");
    }
}
