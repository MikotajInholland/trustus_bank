// One transaction returned to the frontend.
// @author Mikotaj (Dev 3 — Auditor)
package com.trustus.bank.dto;

import com.trustus.bank.common.enums.TransactionType;

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
