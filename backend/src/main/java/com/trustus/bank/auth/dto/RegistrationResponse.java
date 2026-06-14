/**
 * @summary Confirmation returned after customer registration. 
 * @author Wesley (Dev 1 — Gatekeeper)
 */
package com.trustus.bank.auth.dto;

public record RegistrationResponse(
        Long customerId,
        String email,
        String message
) {
}
