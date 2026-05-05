package org.example.sellsight.user.application.dto;

public record TotpChallengeResponse(boolean requires2fa, String challengeToken, String firstName) {}
