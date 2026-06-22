/**
 * @summary Customer profile and account balances for the dashboard. 
 * @author Darlington (Dev 2 — Teller)
 */
package com.trustus.bank.dto;

import java.math.BigDecimal;
import java.util.List;

public record CustomerDashboardDto(
        Long customerId,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        List<AccountDto> accounts,
        BigDecimal combinedBalance,
        String currency
) {
}
