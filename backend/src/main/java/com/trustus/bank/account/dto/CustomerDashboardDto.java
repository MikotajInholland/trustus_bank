package com.trustus.bank.account.dto;

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
