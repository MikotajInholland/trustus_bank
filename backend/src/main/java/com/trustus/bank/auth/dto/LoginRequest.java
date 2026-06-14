/**
 * @summary Login credentials (email and password). 
 * @author Wesley (Dev 1 — Gatekeeper)
 */
package com.trustus.bank.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
) {
}
