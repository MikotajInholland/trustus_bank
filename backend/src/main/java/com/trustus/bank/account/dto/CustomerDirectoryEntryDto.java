package com.trustus.bank.account.dto;

public record CustomerDirectoryEntryDto(
        Long customerId,
        String firstName,
        String lastName,
        String email,
        String checkingIban
) {
}
