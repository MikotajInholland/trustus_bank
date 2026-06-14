package com.trustus.bank.auth.dto;

public record CustomerSummaryDto(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        boolean approved
) {
}
