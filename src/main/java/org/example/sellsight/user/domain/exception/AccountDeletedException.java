package org.example.sellsight.user.domain.exception;

public class AccountDeletedException extends RuntimeException {
    public AccountDeletedException() {
        super("This account has been deleted.");
    }
}
