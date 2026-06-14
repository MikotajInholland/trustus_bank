package com.trustus.bank.transfer.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record UpdateLimitsRequest(
        @NotNull @DecimalMin("0.00") BigDecimal dailyTransferLimit,
        @NotNull @DecimalMin("0.00") BigDecimal absoluteTransferLimit
) {
}
