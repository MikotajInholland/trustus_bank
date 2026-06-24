// External transfers, limits, and transaction history endpoints.
// @author Mikotaj (Dev 3 — Auditor)
package com.trustus.bank.controllers;

import com.trustus.bank.common.dto.PageResponse;
import com.trustus.bank.common.openapi.ProtectedApiResponses;
import com.trustus.bank.dto.CustomerLimitsDto;
import com.trustus.bank.dto.ExternalTransferRequest;
import com.trustus.bank.dto.TransactionDto;
import com.trustus.bank.dto.UpdateLimitsRequest;
import com.trustus.bank.services.TransferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.Instant;

// Transfers, limits, transaction history, and global ledger.
// @author Mikotaj (Dev 3 — Auditor)
@RestController
@RequestMapping("/api")
@ProtectedApiResponses
@Tag(name = "Transfers & Auditing", description = "Mikotaj (Dev 3) — Transfers, limits, and transaction history")
public class TransferController {

    private final TransferService transferService;

    // Injects the transfer business service.
    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping("/customer/transfers/external")
    @Operation(
            summary = "Customer external transfer from checking account",
            description = """
                    Requires approved **CUSTOMER**.
                    **400:** `Cannot transfer to your own account`, `Cannot transfer to the same account`,
                    `Insufficient balance`, or daily/absolute limit exceeded.
                    **404:** destination or checking account not found.
                    """
    )
    @ApiResponse(responseCode = "204", description = "Transfer completed")
    public ResponseEntity<Void> customerTransfer(
            Authentication authentication,
            @Valid @RequestBody ExternalTransferRequest request
    ) {
        transferService.customerExternalTransfer(authentication.getName(), request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/employee/customers/{customerId}/transfers")
    @Operation(
            summary = "Employee transfer on behalf of a customer",
            description = """
                    Requires **EMPLOYEE** role.
                    **400:** same business rules as customer external transfer.
                    **404:** customer, destination, or checking account not found.
                    """
    )
    @ApiResponse(responseCode = "204", description = "Transfer completed")
    public ResponseEntity<Void> employeeTransfer(
            @PathVariable Long customerId,
            @Valid @RequestBody ExternalTransferRequest request
    ) {
        transferService.employeeExternalTransfer(customerId, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/employee/customers/{customerId}/limits")
    @Operation(
            summary = "View customer transfer limits",
            description = "Requires **EMPLOYEE** role. **404:** customer not found."
    )
    public ResponseEntity<CustomerLimitsDto> getLimits(@PathVariable Long customerId) {
        return ResponseEntity.ok(transferService.getLimits(customerId));
    }

    @PutMapping("/employee/customers/{customerId}/limits")
    @Operation(
            summary = "Update customer transfer limits",
            description = "Requires **EMPLOYEE** role. **404:** customer not found."
    )
    public ResponseEntity<CustomerLimitsDto> updateLimits(
            @PathVariable Long customerId,
            @Valid @RequestBody UpdateLimitsRequest request
    ) {
        return ResponseEntity.ok(transferService.updateLimits(customerId, request));
    }

    @GetMapping("/customer/transactions")
    @Operation(
            summary = "Customer transaction history with filters",
            description = "Requires approved **CUSTOMER**. Supports optional date, amount, and IBAN filters with pagination."
    )
    public ResponseEntity<PageResponse<TransactionDto>> customerTransactions(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) BigDecimal exactAmount,
            @RequestParam(required = false) String iban,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(transferService.getCustomerTransactions(
                authentication.getName(),
                startDate,
                endDate,
                minAmount,
                maxAmount,
                exactAmount,
                iban,
                pageable
        ));
    }

    @GetMapping("/employee/customers/{customerId}/transactions")
    @Operation(
            summary = "Employee view of a customer's transaction history",
            description = "Requires **EMPLOYEE** role. **404:** customer not found."
    )
    public ResponseEntity<PageResponse<TransactionDto>> employeeCustomerTransactions(
            @PathVariable Long customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) BigDecimal exactAmount,
            @RequestParam(required = false) String iban,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(transferService.getTransactionsForCustomerId(
                customerId,
                startDate,
                endDate,
                minAmount,
                maxAmount,
                exactAmount,
                iban,
                pageable
        ));
    }

    @GetMapping("/employee/ledger")
    @Operation(
            summary = "Global ledger of all transactions",
            description = "Requires **EMPLOYEE** role. Returns all transactions, paginated (default page size 50)."
    )
    public ResponseEntity<PageResponse<TransactionDto>> globalLedger(
            @PageableDefault(size = 50) Pageable pageable
    ) {
        return ResponseEntity.ok(transferService.getGlobalLedger(pageable));
    }
}
