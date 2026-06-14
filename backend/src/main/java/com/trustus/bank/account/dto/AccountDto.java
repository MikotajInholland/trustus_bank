package com.trustus.bank.account.dto;

import com.trustus.bank.common.enums.AccountType;

import java.math.BigDecimal;

public record AccountDto(
        Long id,
        AccountType type,
        String iban,
        BigDecimal balance,
        String currency,
        boolean active
) {
}
