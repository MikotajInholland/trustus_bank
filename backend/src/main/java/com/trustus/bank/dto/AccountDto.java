/**
 * @summary Account type, IBAN, and balance for API responses. 
 * @author Darlington (Dev 2 — Teller)
 */
package com.trustus.bank.dto;

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
