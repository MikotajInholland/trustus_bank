// Request body for employee customer approval.
// @author Wesley (Dev 1 — Gatekeeper)
package com.trustus.bank.dto;

import java.math.BigDecimal;

public record ApprovalRequest(
        BigDecimal dailyTransferLimit,
        BigDecimal absoluteTransferLimit
) {
}
