package org.example.sellsight.user.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.sellsight.shared.exception.ErrorResponse;
import org.example.sellsight.user.application.dto.AuthResponse;
import org.example.sellsight.user.application.dto.LoginRequest;
import org.example.sellsight.user.application.dto.OAuthLoginRequest;
import org.example.sellsight.user.application.dto.RegisterRequest;
import org.example.sellsight.user.application.usecase.LoginUserUseCase;
import org.example.sellsight.user.application.usecase.OAuthLoginUseCase;
import org.example.sellsight.user.application.usecase.RegisterUserUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints (register + login).
 * All endpoints are public — no JWT required.
 */
@Tag(name = "Authentication", description = "Register a new account or obtain a JWT token")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final RegisterUserUseCase registerUserUseCase;
    private final LoginUserUseCase loginUserUseCase;
    private final OAuthLoginUseCase oAuthLoginUseCase;

    public AuthController(RegisterUserUseCase registerUserUseCase,
                           LoginUserUseCase loginUserUseCase,
                           OAuthLoginUseCase oAuthLoginUseCase) {
        this.registerUserUseCase = registerUserUseCase;
        this.loginUserUseCase = loginUserUseCase;
        this.oAuthLoginUseCase = oAuthLoginUseCase;
    }

    @Operation(
        operationId = "register",
        summary     = "Register a new user",
        description = "Creates a new account with the requested role (ADMIN | SELLER | CUSTOMER) "
                    + "and returns a signed JWT token."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Account created — JWT returned",
            content = @Content(schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(responseCode = "409", description = "Email already in use",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "400", description = "Validation error",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = registerUserUseCase.execute(request);
        return ResponseEntity.ok(response);
    }

    @Operation(
        operationId = "login",
        summary     = "Authenticate (login)",
        description = "Validates credentials and returns a signed JWT token valid for 24 hours."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Authenticated — JWT returned",
            content = @Content(schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(responseCode = "401", description = "Invalid email or password",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = loginUserUseCase.execute(request);
        return ResponseEntity.ok(response);
    }

    @Operation(
        operationId = "oauthLogin",
        summary     = "OAuth2 login/signup",
        description = "Exchanges an OAuth2 authorization code (Google or Slack) for a JWT. "
                    + "Creates a new account if the user doesn't exist yet."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Authenticated — JWT returned",
            content = @Content(schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid provider or code",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/oauth")
    public ResponseEntity<AuthResponse> oauthLogin(@Valid @RequestBody OAuthLoginRequest request) {
        AuthResponse response = oAuthLoginUseCase.execute(request);
        return ResponseEntity.ok(response);
    }
}
