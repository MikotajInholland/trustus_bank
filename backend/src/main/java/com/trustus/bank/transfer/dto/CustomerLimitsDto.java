/**
 * @summary Daily and absolute transfer limits for a customer. 
 * @author Mikotaj (Dev 3 — Auditor)
 */
package com.trustus.bank.transfer.dto;

import java.math.BigDecimal;

public record CustomerLimitsDto(
        Long customerId,
        String customerName,
        BigDecimal dailyTransferLimit,
        BigDecimal absoluteTransferLimit,
        String currency
) {
}
