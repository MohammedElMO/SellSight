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

@Tag(name = "Authentication", description = "Register, login, OAuth, email verification, password reset, admin 2FA setup")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final RegisterUserUseCase registerUserUseCase;
    private final LoginUserUseCase loginUserUseCase;
    private final Verify2faUseCase verify2faUseCase;
    private final Initiate2faSetupUseCase initiate2faSetupUseCase;
    private final Complete2faSetupUseCase complete2faSetupUseCase;
    private final BootstrapPasswordChangeUseCase bootstrapPasswordChangeUseCase;
    private final OAuthLoginUseCase oAuthLoginUseCase;
    private final VerifyEmailUseCase verifyEmailUseCase;
    private final ResendVerificationUseCase resendVerificationUseCase;
    private final RequestPasswordResetUseCase requestPasswordResetUseCase;
    private final ResetPasswordUseCase resetPasswordUseCase;
    private final ChangePasswordUseCase changePasswordUseCase;
    private final RefreshAccessTokenUseCase refreshAccessTokenUseCase;
    private final LogoutUseCase logoutUseCase;
    private final LogoutAllDevicesUseCase logoutAllDevicesUseCase;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;

    public AuthController(RegisterUserUseCase registerUserUseCase,
                          LoginUserUseCase loginUserUseCase,
                          Verify2faUseCase verify2faUseCase,
                          Initiate2faSetupUseCase initiate2faSetupUseCase,
                          Complete2faSetupUseCase complete2faSetupUseCase,
                          BootstrapPasswordChangeUseCase bootstrapPasswordChangeUseCase,
                          OAuthLoginUseCase oAuthLoginUseCase,
                          VerifyEmailUseCase verifyEmailUseCase,
                          ResendVerificationUseCase resendVerificationUseCase,
                          RequestPasswordResetUseCase requestPasswordResetUseCase,
                          ResetPasswordUseCase resetPasswordUseCase,
                          ChangePasswordUseCase changePasswordUseCase,
                          RefreshAccessTokenUseCase refreshAccessTokenUseCase,
                          LogoutUseCase logoutUseCase,
                          LogoutAllDevicesUseCase logoutAllDevicesUseCase,
                          RefreshTokenService refreshTokenService,
                          UserRepository userRepository) {
        this.registerUserUseCase = registerUserUseCase;
        this.loginUserUseCase = loginUserUseCase;
        this.verify2faUseCase = verify2faUseCase;
        this.initiate2faSetupUseCase = initiate2faSetupUseCase;
        this.complete2faSetupUseCase = complete2faSetupUseCase;
        this.bootstrapPasswordChangeUseCase = bootstrapPasswordChangeUseCase;
        this.oAuthLoginUseCase = oAuthLoginUseCase;
        this.verifyEmailUseCase = verifyEmailUseCase;
        this.resendVerificationUseCase = resendVerificationUseCase;
        this.requestPasswordResetUseCase = requestPasswordResetUseCase;
        this.resetPasswordUseCase = resetPasswordUseCase;
        this.changePasswordUseCase = changePasswordUseCase;
        this.refreshAccessTokenUseCase = refreshAccessTokenUseCase;
        this.logoutUseCase = logoutUseCase;
        this.logoutAllDevicesUseCase = logoutAllDevicesUseCase;
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
    }

    @Operation(operationId = "register", summary = "Register a new user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Account created",
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

    @Operation(operationId = "login", summary = "Authenticate — returns AuthResponse, TotpChallengeResponse (2FA), or Admin2faSetupRequiredResponse (first-time setup)")
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
                                    HttpServletRequest httpRequest) {
        LoginOutcome outcome = loginUserUseCase.execute(request, extractIp(httpRequest), extractUserAgent(httpRequest));
        return switch (outcome) {
            case LoginOutcome.Success s -> buildAuthResponse(s.bundle(), httpRequest);
            case LoginOutcome.Requires2fa r -> ResponseEntity.ok(
                    new TotpChallengeResponse(true, r.challengeToken(), r.firstName()));
            case LoginOutcome.Requires2faSetup s -> ResponseEntity.ok(
                    new Admin2faSetupRequiredResponse(true, s.setupToken(), s.firstName()));
        };
    }

    @Operation(operationId = "verify2fa", summary = "Submit TOTP code to complete admin login")
    @PostMapping("/verify-2fa")
    public ResponseEntity<AuthResponse> verify2fa(@Valid @RequestBody Verify2faRequest request,
                                                   HttpServletRequest httpRequest) {
        AuthBundle bundle = verify2faUseCase.execute(
                request.challengeToken(), request.code(),
                extractIp(httpRequest), extractUserAgent(httpRequest));
        return buildAuthResponse(bundle, httpRequest);
    }

    @Operation(operationId = "initiate2faSetup", summary = "Initiate 2FA setup using setup token — returns QR code and secret")
    @PostMapping("/2fa-setup/start")
    public ResponseEntity<TotpSetupResponse> initiate2faSetup(
            @Valid @RequestBody InitiateAdmin2faSetupRequest request) {
        return ResponseEntity.ok(initiate2faSetupUseCase.execute(request.setupToken()));
    }

    @Operation(operationId = "complete2faSetup", summary = "Complete 2FA setup — verify TOTP code, issue full auth cookies, return backup codes")
    @PostMapping("/2fa-setup/complete")
    public ResponseEntity<Setup2faCompleteResponse> complete2faSetup(
            @Valid @RequestBody CompleteAdmin2faSetupRequest request,
            HttpServletRequest httpRequest) {
        SetupCompleteBundle result = complete2faSetupUseCase.execute(
                request.setupToken(), request.code(),
                extractIp(httpRequest), extractUserAgent(httpRequest));
        AuthBundle bundle = result.authBundle();
        AuthResponse auth = bundle.authResponse();
        boolean secure = isSecure(httpRequest);
        Setup2faCompleteResponse body = new Setup2faCompleteResponse(
                auth.email(), auth.role(), auth.firstName(), auth.lastName(),
                auth.emailVerified(), auth.sellerStatus(),
                result.backupCodes()
        );
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenService.buildCookie(bundle.rawRefreshToken(), secure).toString())
                .header(HttpHeaders.SET_COOKIE, refreshTokenService.buildAccessCookie(auth.token(), secure).toString())
                .header(HttpHeaders.SET_COOKIE, refreshTokenService.buildSessionCookie(auth.role(), auth.emailVerified(), auth.sellerStatus(), secure).toString())
                .body(body);
    }

    @Operation(operationId = "bootstrapChangePassword",
               summary = "Bootstrap: change temporary password and initiate 2FA setup — returns QR code. Public endpoint gated by setup token.")
    @PostMapping("/bootstrap/change-password")
    public ResponseEntity<TotpSetupResponse> bootstrapChangePassword(
            @Valid @RequestBody BootstrapChangePasswordRequest request) {
        return ResponseEntity.ok(bootstrapPasswordChangeUseCase.execute(
                request.setupToken(), request.newPassword()));
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

    @Operation(operationId = "accountStatus", summary = "Check account status by email")
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
                .header(HttpHeaders.SET_COOKIE, refreshTokenService.clearAccessCookie().toString())
                .header(HttpHeaders.SET_COOKIE, refreshTokenService.clearSessionCookie().toString())
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
                .header(HttpHeaders.SET_COOKIE, refreshTokenService.clearAccessCookie().toString())
                .header(HttpHeaders.SET_COOKIE, refreshTokenService.clearSessionCookie().toString())
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────

    private ResponseEntity<AuthResponse> buildAuthResponse(AuthBundle bundle, HttpServletRequest httpRequest) {
        boolean secure = isSecure(httpRequest);
        AuthResponse auth = bundle.authResponse();
        AuthResponse safeAuth = new AuthResponse(
                null, auth.email(), auth.role(),
                auth.firstName(), auth.lastName(),
                auth.emailVerified(), auth.sellerStatus()
        );
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenService.buildCookie(bundle.rawRefreshToken(), secure).toString())
                .header(HttpHeaders.SET_COOKIE, refreshTokenService.buildAccessCookie(auth.token(), secure).toString())
                .header(HttpHeaders.SET_COOKIE, refreshTokenService.buildSessionCookie(auth.role(), auth.emailVerified(), auth.sellerStatus(), secure).toString())
                .body(safeAuth);
    }

    private boolean isSecure(HttpServletRequest request) {
        return "https".equalsIgnoreCase(request.getScheme())
                || request.getServerName().endsWith(".sellsights.com");
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
