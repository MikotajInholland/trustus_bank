/**
 * @summary ATM deposit or withdrawal amount. 
 * @author Darlington (Dev 2 — Teller)
 */
package com.trustus.bank.account.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record AtmTransactionRequest(
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount
) {
}
