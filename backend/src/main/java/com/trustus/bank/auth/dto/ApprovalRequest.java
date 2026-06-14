/** @summary Request body for employee customer approval. */
package com.trustus.bank.auth.dto;

import java.math.BigDecimal;

public record ApprovalRequest(
        BigDecimal dailyTransferLimit,
        BigDecimal absoluteTransferLimit
) {
}
