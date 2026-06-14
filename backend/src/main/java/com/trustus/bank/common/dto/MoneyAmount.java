/** @summary Validated monetary amount wrapper. */
package com.trustus.bank.common.dto;

import java.math.BigDecimal;

public record MoneyAmount(BigDecimal amount, String currency) {

    public static MoneyAmount eur(BigDecimal amount) {
        return new MoneyAmount(amount, "EUR");
    }
}
