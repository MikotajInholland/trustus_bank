/**
 * @summary Transfer between a customer's own accounts. 
 * @author Darlington (Dev 2 — Teller)
 */
package com.trustus.bank.dto;

import com.trustus.bank.common.enums.AccountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record InternalTransferRequest(
        @NotNull AccountType fromAccountType,
        @NotNull AccountType toAccountType,
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount
) {
}
