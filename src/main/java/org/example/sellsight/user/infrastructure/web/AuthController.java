package org.example.sellsight.user.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.example.sellsight.config.security.RefreshTokenService;
import org.example.sellsight.shared.exception.ErrorResponse;
import org.example.sellsight.user.application.dto.*;
import org.example.sellsight.user.application.usecase.*;
import org.example.sellsight.user.domain.model.Email;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Authentication", description = "Register, login, OAuth, email verification, password reset")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final RegisterUserUseCase registerUserUseCase;
    private final LoginUserUseCase loginUserUseCase;
    private final OAuthLoginUseCase oAuthLoginUseCase;
    private final VerifyEmailUseCase verifyEmailUseCase;
    private final ResendVerificationUseCase resendVerificationUseCase;
    private final RequestPasswordResetUseCase requestPasswordResetUseCase;
    private final ResetPasswordUseCase resetPasswordUseCase;
    private final ChangePasswordUseCase changePasswordUseCase;
    private final RefreshAccessTokenUseCase refreshAccessTokenUseCase;
    private final LogoutUseCase logoutUseCase;
    private final LogoutAllDevicesUseCase logoutAllDevicesUseCase;
    private final RefreshTokenUseCase refreshTokenUseCase;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;

    public AuthController(RegisterUserUseCase registerUserUseCase,
                          LoginUserUseCase loginUserUseCase,
                          OAuthLoginUseCase oAuthLoginUseCase,
                          VerifyEmailUseCase verifyEmailUseCase,
                          ResendVerificationUseCase resendVerificationUseCase,
                          RequestPasswordResetUseCase requestPasswordResetUseCase,
                          ResetPasswordUseCase resetPasswordUseCase,
                          ChangePasswordUseCase changePasswordUseCase,
                          RefreshAccessTokenUseCase refreshAccessTokenUseCase,
                          LogoutUseCase logoutUseCase,
                          LogoutAllDevicesUseCase logoutAllDevicesUseCase,
                          RefreshTokenUseCase refreshTokenUseCase,
                          RefreshTokenService refreshTokenService,
                          UserRepository userRepository) {
        this.registerUserUseCase = registerUserUseCase;
        this.loginUserUseCase = loginUserUseCase;
        this.oAuthLoginUseCase = oAuthLoginUseCase;
        this.verifyEmailUseCase = verifyEmailUseCase;
        this.resendVerificationUseCase = resendVerificationUseCase;
        this.requestPasswordResetUseCase = requestPasswordResetUseCase;
        this.resetPasswordUseCase = resetPasswordUseCase;
        this.changePasswordUseCase = changePasswordUseCase;
        this.refreshAccessTokenUseCase = refreshAccessTokenUseCase;
        this.logoutUseCase = logoutUseCase;
        this.logoutAllDevicesUseCase = logoutAllDevicesUseCase;
        this.refreshTokenUseCase = refreshTokenUseCase;
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
    }

    @Operation(operationId = "register", summary = "Register a new user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Account created — JWT returned",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "409", description = "Email already in use",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
                                                  HttpServletRequest httpRequest) {
        AuthBundle bundle = registerUserUseCase.execute(request, extractIp(httpRequest), extractUserAgent(httpRequest));
        return buildAuthResponse(bundle, httpRequest);
    }

    @Operation(operationId = "login", summary = "Authenticate")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                               HttpServletRequest httpRequest) {
        AuthBundle bundle = loginUserUseCase.execute(request, extractIp(httpRequest), extractUserAgent(httpRequest));
        return buildAuthResponse(bundle, httpRequest);
    }

    @Operation(operationId = "oauthLogin", summary = "OAuth2 login/signup")
    @PostMapping("/oauth")
    public ResponseEntity<AuthResponse> oauthLogin(@Valid @RequestBody OAuthLoginRequest request,
                                                    HttpServletRequest httpRequest) {
        AuthBundle bundle = oAuthLoginUseCase.execute(request, extractIp(httpRequest), extractUserAgent(httpRequest));
        return buildAuthResponse(bundle, httpRequest);
    }

    @Operation(operationId = "verifyEmail", summary = "Verify email with token — returns a fresh JWT")
    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request,
                                                     HttpServletRequest httpRequest) {
        AuthBundle bundle = verifyEmailUseCase.execute(request.token(), extractIp(httpRequest), extractUserAgent(httpRequest));
        return buildAuthResponse(bundle, httpRequest);
    }

    @Operation(operationId = "accountStatus", summary = "Check account status by email (for polling on suspended/deleted screens)")
    @GetMapping("/account-status")
    public ResponseEntity<AccountStatusDto> accountStatus(@RequestParam String email) {
        return userRepository.findByEmail(new Email(email))
                .map(u -> {
                    if (u.isDeleted())  return ResponseEntity.ok(AccountStatusDto.DELETED);
                    if (u.isDisabled()) return ResponseEntity.ok(AccountStatusDto.DISABLED);
                    return ResponseEntity.ok(AccountStatusDto.ACTIVE);
                })
                .orElseGet(() -> ResponseEntity.ok(AccountStatusDto.ACTIVE));
    }

    @Operation(operationId = "resendVerification", summary = "Resend the verification email")
    @PostMapping("/resend-verification")
    public ResponseEntity<Void> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        resendVerificationUseCase.execute(request.email());
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "forgotPassword", summary = "Start password reset flow")
    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        requestPasswordResetUseCase.execute(request.email());
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "resetPassword", summary = "Complete password reset with token")
    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        resetPasswordUseCase.execute(request.token(), request.newPassword());
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "changePassword", summary = "Change password (authenticated)")
    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                               @AuthenticationPrincipal UserDetails principal) {
        changePasswordUseCase.execute(principal.getUsername(), request.oldPassword(), request.newPassword());
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "refresh", summary = "Refresh access token using HttpOnly refresh token cookie")
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest httpRequest) {
        String rawToken = extractRefreshCookie(httpRequest);
        AuthBundle bundle = refreshAccessTokenUseCase.execute(rawToken, extractIp(httpRequest), extractUserAgent(httpRequest));
        return buildAuthResponse(bundle, httpRequest);
    }

    @Operation(operationId = "logout", summary = "Logout — revoke refresh token cookie")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest) {
        String rawToken = extractRefreshCookie(httpRequest);
        logoutUseCase.execute(rawToken);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, refreshTokenService.clearCookie().toString())
                .build();
    }

    @Operation(operationId = "logoutAll", summary = "Logout from all devices")
    @PostMapping("/logout-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> logoutAll(@AuthenticationPrincipal UserDetails principal,
                                           HttpServletRequest httpRequest) {
        String userId = userRepository.findByEmail(new Email(principal.getUsername()))
                .map(u -> u.getId().getValue())
                .orElse(null);
        if (userId != null) {
            logoutAllDevicesUseCase.execute(userId);
        }
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, refreshTokenService.clearCookie().toString())
                .build();
    }

    /**
     * Legacy endpoint — kept for backward compat.
     * Requires valid Bearer JWT, re-issues access token from DB state.
     */
    @Operation(operationId = "refreshToken", summary = "Re-issue JWT with current user state from DB (legacy)")
    @PostMapping("/refresh-token")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AuthResponse> refreshToken(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(refreshTokenUseCase.execute(principal.getUsername()));
    }

    // ── Helpers ───────────────────────────────────────────────

    private ResponseEntity<AuthResponse> buildAuthResponse(AuthBundle bundle, HttpServletRequest httpRequest) {
        boolean secure = "https".equalsIgnoreCase(httpRequest.getScheme())
                || httpRequest.getServerName().endsWith(".sellsights.com");
        String cookie = refreshTokenService.buildCookie(bundle.rawRefreshToken(), secure).toString();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie)
                .body(bundle.authResponse());
    }

    private String extractIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String extractUserAgent(HttpServletRequest request) {
        return request.getHeader("User-Agent");
    }

    private String extractRefreshCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if ("refresh_token".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
