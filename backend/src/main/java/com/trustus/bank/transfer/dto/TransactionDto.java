/**
 * @summary Single ledger transaction for API responses. 
 * @author Mikotaj (Dev 3 — Auditor)
 */
package com.trustus.bank.transfer.dto;

import com.trustus.bank.common.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;

public record TransactionDto(
        Long id,
        String fromIban,
        String toIban,
        BigDecimal amount,
        String currency,
        Instant timestamp,
        TransactionType type
) {
}
