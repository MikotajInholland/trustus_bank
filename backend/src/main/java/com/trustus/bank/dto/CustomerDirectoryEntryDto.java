// Directory search result with name and checking IBAN.
// @author Darlington (Dev 2 — Teller)
package com.trustus.bank.dto;

public record CustomerDirectoryEntryDto(
        Long customerId,
        String firstName,
        String lastName,
        String email,
        String checkingIban
) {
}
