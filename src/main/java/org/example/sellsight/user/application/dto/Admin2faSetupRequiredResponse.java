package org.example.sellsight.user.application.dto;

public record Admin2faSetupRequiredResponse(boolean requires2faSetup, String setupToken, String firstName) {}
