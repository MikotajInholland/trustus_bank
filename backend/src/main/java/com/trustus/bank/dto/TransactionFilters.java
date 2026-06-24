// Optional query filters for transaction history.
// @author Mikotaj (Dev 3 — Auditor)
package com.trustus.bank.dto;

import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.Instant;

public record TransactionFilters(
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
        BigDecimal minAmount,
        BigDecimal maxAmount,
        BigDecimal exactAmount,
        String iban
) {
}
