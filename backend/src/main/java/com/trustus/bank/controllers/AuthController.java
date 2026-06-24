// REST API for auth, registration, and customer onboarding.
// @author Wesley (Dev 1 — Gatekeeper)
package com.trustus.bank.controllers;

import com.trustus.bank.dto.ApprovalRequest;
import com.trustus.bank.dto.CustomerSummaryDto;
import com.trustus.bank.dto.LoginRequest;
import com.trustus.bank.dto.LoginResponse;
import com.trustus.bank.dto.RegistrationRequest;
import com.trustus.bank.dto.RegistrationResponse;
import com.trustus.bank.services.AuthService;
import com.trustus.bank.services.CustomerApprovalService;
import com.trustus.bank.common.dto.PageResponse;
import com.trustus.bank.common.openapi.ProtectedApiResponses;
import com.trustus.bank.common.openapi.PublicWriteApiResponses;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(name = "Auth & Onboarding", description = "Wesley (Dev 1) — Security, identity, and customer onboarding")
public class AuthController {

    private final AuthService authService;
    private final CustomerApprovalService customerApprovalService;

    public AuthController(AuthService authService, CustomerApprovalService customerApprovalService) {
        this.authService = authService;
        this.customerApprovalService = customerApprovalService;
    }

    @PostMapping("/auth/login")
    @SecurityRequirements
    @PublicWriteApiResponses
    @Operation(
            summary = "Authenticate user and issue JWT",
            description = "Returns a JWT on success. **400:** `Invalid email or password`."
    )
    @ApiResponse(responseCode = "200", description = "Login successful — copy `token` into Authorize")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @SecurityRequirements
    @PublicWriteApiResponses
    @Operation(
            summary = "Register a new customer",
            description = """
                    Creates an unapproved customer account.
                    **400:** `Email is already registered`, `BSN is already registered`, or validation errors.
                    """
    )
    @ApiResponse(responseCode = "201", description = "Registration accepted — awaiting employee approval")
    public ResponseEntity<RegistrationResponse> register(@Valid @RequestBody RegistrationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @GetMapping("/employee/approvals")
    @ProtectedApiResponses
    @Operation(
            summary = "List customers awaiting approval",
            description = "Requires **EMPLOYEE** role."
    )
    public ResponseEntity<PageResponse<CustomerSummaryDto>> listPendingApprovals(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(authService.listPendingApprovals(pageable, search));
    }

    @PostMapping("/employee/approvals/{customerId}")
    @ProtectedApiResponses
    @Operation(
            summary = "Approve customer and provision accounts",
            description = "Requires **EMPLOYEE** role. **400:** `Customer is already approved`. **404:** customer or user not found."
    )
    public ResponseEntity<CustomerSummaryDto> approveCustomer(
            @PathVariable Long customerId,
            @Valid @RequestBody ApprovalRequest request
    ) {
        return ResponseEntity.ok(customerApprovalService.approveCustomer(customerId, request));
    }

    @PostMapping("/employee/customers/{customerId}/close")
    @ProtectedApiResponses
    @Operation(
            summary = "Close customer accounts and disable user",
            description = "Requires **EMPLOYEE** role. **404:** customer or user not found."
    )
    @ApiResponse(responseCode = "204", description = "Accounts closed and user disabled")
    public ResponseEntity<Void> closeCustomer(@PathVariable Long customerId) {
        customerApprovalService.closeCustomerAccounts(customerId);
        return ResponseEntity.noContent().build();
    }
}
