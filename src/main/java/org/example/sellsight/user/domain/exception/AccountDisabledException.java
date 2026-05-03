package org.example.sellsight.user.domain.exception;

public class AccountDisabledException extends RuntimeException {
    public AccountDisabledException() {
        super("Account has been disabled. Please contact support.");
    }
}
