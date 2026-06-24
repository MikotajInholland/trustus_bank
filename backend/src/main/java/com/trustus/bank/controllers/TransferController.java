// REST endpoints for transfers, limits, and transaction history.
// @author Mikotaj (Dev 3 — Auditor)
package com.trustus.bank.controllers;

import com.trustus.bank.common.dto.PageResponse;
import com.trustus.bank.common.openapi.ProtectedApiResponses;
import com.trustus.bank.dto.CustomerLimitsDto;
import com.trustus.bank.dto.ExternalTransferRequest;
import com.trustus.bank.dto.TransactionDto;
import com.trustus.bank.dto.TransactionFilters;
import com.trustus.bank.dto.UpdateLimitsRequest;
import com.trustus.bank.services.TransferService;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@ProtectedApiResponses
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping("/customer/transfers/external")
    public ResponseEntity<Void> customerTransfer(
            Authentication authentication,
            @Valid @RequestBody ExternalTransferRequest request
    ) {
        transferService.customerExternalTransfer(authentication.getName(), request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/employee/customers/{customerId}/transfers")
    public ResponseEntity<Void> employeeTransfer(
            @PathVariable Long customerId,
            @Valid @RequestBody ExternalTransferRequest request
    ) {
        transferService.employeeExternalTransfer(customerId, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/employee/customers/{customerId}/limits")
    public ResponseEntity<CustomerLimitsDto> getLimits(@PathVariable Long customerId) {
        return ResponseEntity.ok(transferService.getLimits(customerId));
    }

    @PutMapping("/employee/customers/{customerId}/limits")
    public ResponseEntity<CustomerLimitsDto> updateLimits(
            @PathVariable Long customerId,
            @Valid @RequestBody UpdateLimitsRequest request
    ) {
        return ResponseEntity.ok(transferService.updateLimits(customerId, request));
    }

    @GetMapping("/customer/transactions")
    public ResponseEntity<PageResponse<TransactionDto>> customerTransactions(
            Authentication authentication,
            @ParameterObject TransactionFilters filters,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(transferService.getCustomerTransactions(authentication.getName(), filters, pageable));
    }

    @GetMapping("/employee/customers/{customerId}/transactions")
    public ResponseEntity<PageResponse<TransactionDto>> employeeCustomerTransactions(
            @PathVariable Long customerId,
            @ParameterObject TransactionFilters filters,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(transferService.getTransactionsForCustomerId(customerId, filters, pageable));
    }

    @GetMapping("/employee/ledger")
    public ResponseEntity<PageResponse<TransactionDto>> globalLedger(
            @PageableDefault(size = 50) Pageable pageable
    ) {
        return ResponseEntity.ok(transferService.getGlobalLedger(pageable));
    }
}

// ---------------------------------------------------------------------------
// Swagger — kept at the bottom so the controller above is plain Spring code.
// ---------------------------------------------------------------------------

@Configuration
class TransferControllerSwagger {

    private static final String TAG = "Transfers & Auditing";

    @Bean
    org.springdoc.core.customizers.OperationCustomizer transferApiDescriptions() {
        return (operation, handlerMethod) -> {
            if (!TransferController.class.equals(handlerMethod.getBeanType())) {
                return operation;
            }

            operation.addTagsItem(TAG);

            switch (handlerMethod.getMethod().getName()) {
                case "customerTransfer" -> {
                    operation.summary("Customer external transfer from checking account");
                    operation.getResponses().addApiResponse("204",
                            new io.swagger.v3.oas.models.responses.ApiResponse().description("Transfer completed"));
                }
                case "employeeTransfer" -> {
                    operation.summary("Employee transfer on behalf of a customer");
                    operation.getResponses().addApiResponse("204",
                            new io.swagger.v3.oas.models.responses.ApiResponse().description("Transfer completed"));
                }
                case "getLimits" -> operation.summary("View customer transfer limits");
                case "updateLimits" -> operation.summary("Update customer transfer limits");
                case "customerTransactions" -> operation.summary("Customer transaction history with optional filters");
                case "employeeCustomerTransactions" -> operation.summary("Employee view of a customer's transaction history");
                case "globalLedger" -> operation.summary("Global ledger of all transactions");
                default -> { }
            }

            return operation;
        };
    }

    @Bean
    org.springdoc.core.customizers.OpenApiCustomizer transferApiTag() {
        return openApi -> openApi.getTags().add(
                new io.swagger.v3.oas.models.tags.Tag()
                        .name(TAG)
                        .description("Mikotaj (Dev 3) — Transfers, limits, and transaction history")
        );
    }
}
