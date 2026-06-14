package com.trustus.bank.auth.dto;

public record RegistrationResponse(
        Long customerId,
        String email,
        String message
) {
}
