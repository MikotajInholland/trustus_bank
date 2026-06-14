/** @summary Directory search result with name and checking IBAN. */
package com.trustus.bank.account.dto;

public record CustomerDirectoryEntryDto(
        Long customerId,
        String firstName,
        String lastName,
        String email,
        String checkingIban
) {
}
