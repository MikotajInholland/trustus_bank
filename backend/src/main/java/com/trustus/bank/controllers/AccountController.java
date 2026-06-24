// Customer accounts, dashboard, ATM, and directory endpoints.
// @author Darlington (Dev 2 — Teller)
package com.trustus.bank.controllers;

import com.trustus.bank.dto.AtmTransactionRequest;
import com.trustus.bank.dto.CustomerDashboardDto;
import com.trustus.bank.dto.CustomerDirectoryEntryDto;
import com.trustus.bank.dto.InternalTransferRequest;
import com.trustus.bank.services.AccountService;
import com.trustus.bank.dto.CustomerSummaryDto;
import com.trustus.bank.common.dto.PageResponse;
import com.trustus.bank.common.openapi.ProtectedApiResponses;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@ProtectedApiResponses
@Tag(name = "Accounts & Dashboard", description = "Darlington (Dev 2) — Accounts, dashboard, ATM, and directory")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/customer/dashboard")
    @Operation(
            summary = "Get customer dashboard with accounts and balances",
            description = "Requires approved **CUSTOMER** (or **EMPLOYEE**). **403** if account is pending approval."
    )
    public ResponseEntity<CustomerDashboardDto> getDashboard(Authentication authentication) {
        return ResponseEntity.ok(accountService.getDashboardForEmail(authentication.getName()));
    }

    @GetMapping("/employee/customers")
    @Operation(
            summary = "Paginated list of active customers",
            description = "Requires **EMPLOYEE** role."
    )
    public ResponseEntity<PageResponse<CustomerSummaryDto>> listCustomers(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(accountService.listActiveCustomers(pageable, search));
    }

    @GetMapping("/directory/customers")
    @Operation(
            summary = "Search customers by name (shared directory service)",
            description = "Requires authentication. Returns approved customers matching `query` (excludes caller)."
    )
    public ResponseEntity<List<CustomerDirectoryEntryDto>> searchDirectory(
            Authentication authentication,
            @RequestParam String query
    ) {
        return ResponseEntity.ok(accountService.searchDirectory(query, authentication.getName()));
    }

    @PostMapping("/customer/transfers/internal")
    @Operation(
            summary = "Transfer between own checking and savings accounts",
            description = "Requires approved **CUSTOMER**. **400:** `Insufficient balance`. **404:** account not found."
    )
    @ApiResponse(responseCode = "204", description = "Transfer completed")
    public ResponseEntity<Void> internalTransfer(
            Authentication authentication,
            @Valid @RequestBody InternalTransferRequest request
    ) {
        accountService.internalTransfer(authentication.getName(), request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/atm/deposit")
    @Operation(
            summary = "ATM deposit into checking account",
            description = "Requires approved **CUSTOMER**. **404:** checking account not found."
    )
    @ApiResponse(responseCode = "204", description = "Deposit recorded")
    public ResponseEntity<Void> atmDeposit(
            Authentication authentication,
            @Valid @RequestBody AtmTransactionRequest request
    ) {
        accountService.atmDeposit(authentication.getName(), request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/atm/withdraw")
    @Operation(
            summary = "ATM withdrawal from checking account",
            description = """
                    Requires approved **CUSTOMER**.
                    **400:** `Insufficient balance`, or transfer limit exceeded.
                    **404:** checking account not found.
                    """
    )
    @ApiResponse(responseCode = "204", description = "Withdrawal recorded")
    public ResponseEntity<Void> atmWithdraw(
            Authentication authentication,
            @Valid @RequestBody AtmTransactionRequest request
    ) {
        accountService.atmWithdraw(authentication.getName(), request);
        return ResponseEntity.noContent().build();
    }
}
