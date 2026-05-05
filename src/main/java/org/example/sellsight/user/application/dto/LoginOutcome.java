package org.example.sellsight.user.application.dto;

public sealed interface LoginOutcome permits LoginOutcome.Success, LoginOutcome.Requires2fa, LoginOutcome.Requires2faSetup {
    record Success(AuthBundle bundle) implements LoginOutcome {}
    record Requires2fa(String challengeToken, String firstName) implements LoginOutcome {}
    record Requires2faSetup(String setupToken, String firstName) implements LoginOutcome {}
}
