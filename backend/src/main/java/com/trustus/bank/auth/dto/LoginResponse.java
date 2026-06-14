package com.trustus.bank.auth.dto;

public record LoginResponse(
        String token,
        String email,
        String role,
        boolean approved
) {
}
