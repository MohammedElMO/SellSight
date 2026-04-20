package org.example.sellsight.user.infrastructure.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.sellsight.user.application.dto.AddressDto;
import org.example.sellsight.user.application.dto.UserDto;
import org.example.sellsight.user.application.usecase.GetUserProfileUseCase;
import org.example.sellsight.user.application.usecase.ManageAddressUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Addresses", description = "Manage shipping and billing addresses")
@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final ManageAddressUseCase manageAddressUseCase;
    private final GetUserProfileUseCase getUserProfileUseCase;

    public AddressController(ManageAddressUseCase manageAddressUseCase,
                              GetUserProfileUseCase getUserProfileUseCase) {
        this.manageAddressUseCase = manageAddressUseCase;
        this.getUserProfileUseCase = getUserProfileUseCase;
    }

    @Operation(operationId = "getAddresses", summary = "Get my addresses",
               security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AddressDto>> getAll(Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        return ResponseEntity.ok(manageAddressUseCase.getAll(user.id()));
    }

    @Operation(operationId = "createAddress", summary = "Create an address",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AddressDto> create(@Valid @RequestBody AddressDto dto,
                                              Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        return ResponseEntity.ok(manageAddressUseCase.create(user.id(), dto));
    }

    @Operation(operationId = "updateAddress", summary = "Update an address",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AddressDto> update(@PathVariable String id,
                                              @Valid @RequestBody AddressDto dto,
                                              Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        return ResponseEntity.ok(manageAddressUseCase.update(user.id(), id, dto));
    }

    @Operation(operationId = "deleteAddress", summary = "Delete an address",
               security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> delete(@PathVariable String id, Authentication auth) {
        UserDto user = getUserProfileUseCase.execute(auth.getName());
        manageAddressUseCase.delete(user.id(), id);
        return ResponseEntity.noContent().build();
    }
}
