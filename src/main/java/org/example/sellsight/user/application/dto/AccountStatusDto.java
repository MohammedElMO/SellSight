package org.example.sellsight.user.application.dto;

public record AccountStatusDto(String status) {
    public static final AccountStatusDto ACTIVE   = new AccountStatusDto("ACTIVE");
    public static final AccountStatusDto DISABLED = new AccountStatusDto("DISABLED");
    public static final AccountStatusDto DELETED  = new AccountStatusDto("DELETED");
}
