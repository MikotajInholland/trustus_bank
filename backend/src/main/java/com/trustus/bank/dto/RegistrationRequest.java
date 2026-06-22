/**
 * @summary New customer registration payload. 
 * @author Wesley (Dev 1 — Gatekeeper)
 */
package com.trustus.bank.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegistrationRequest(
        @NotBlank @Size(max = 100) String firstName,
        @NotBlank @Size(max = 100) String lastName,
        @NotBlank @Email String email,
        @NotBlank @Pattern(regexp = "\\d{9}", message = "BSN must be exactly 9 digits") String bsn,
        @NotBlank @Size(max = 20) String phoneNumber,
        @NotBlank @Size(min = 8, max = 100) String password
) {
}
