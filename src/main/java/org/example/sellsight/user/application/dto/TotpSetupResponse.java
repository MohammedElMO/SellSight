package org.example.sellsight.user.application.dto;

/**
 * Returned by the 2FA setup initiation endpoints.
 *
 * Possible states:
 *  - requiresPasswordChange=true  → must call /bootstrap/change-password first; qrCode/secret are null.
 *  - requiresPasswordChange=false, qrCode != null → normal: show QR, then call /2fa-setup/complete.
 *  - requiresPasswordChange=false, qrCode == null → secret already generated (user navigated away);
 *    they can still enter their code or ask SUPER_ADMIN to reset.
 */
public record TotpSetupResponse(boolean requiresPasswordChange, String qrCode, String secret) {}
