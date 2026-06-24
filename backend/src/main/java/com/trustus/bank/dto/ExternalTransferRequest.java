// External transfer destination IBAN and amount.
// @author Mikotaj (Dev 3 — Auditor)
package com.trustus.bank.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ExternalTransferRequest(
        @NotBlank String toIban,
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount
) {
}
