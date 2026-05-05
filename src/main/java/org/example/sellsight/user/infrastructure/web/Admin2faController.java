package org.example.sellsight.user.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.sellsight.user.application.dto.DisableTotpRequest;
import org.example.sellsight.user.application.dto.TotpStatusResponse;
import org.example.sellsight.user.application.usecase.Disable2faUseCase;
import org.example.sellsight.user.application.usecase.GetTotp2faStatusUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Admin 2FA", description = "TOTP-based 2FA management for privileged accounts")
@RestController
@RequestMapping("/api/admin/2fa")
@RequiredArgsConstructor
public class Admin2faController {

    private final GetTotp2faStatusUseCase getTotp2faStatusUseCase;
    private final Disable2faUseCase disable2faUseCase;

    @Operation(operationId = "get2faStatus", summary = "Get 2FA enabled status for the authenticated admin")
    @GetMapping("/status")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<TotpStatusResponse> status(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(getTotp2faStatusUseCase.execute(principal.getUsername()));
    }

    @Operation(operationId = "disable2fa", summary = "Disable 2FA — requires current authenticator code. After this, SUPER_ADMIN must approve re-setup.")
    @DeleteMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> disable(
            @Valid @RequestBody DisableTotpRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        disable2faUseCase.execute(principal.getUsername(), request.code());
        return ResponseEntity.noContent().build();
    }
}
