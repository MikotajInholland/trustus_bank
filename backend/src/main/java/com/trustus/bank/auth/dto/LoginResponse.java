/**
 * @summary JWT and role returned after successful login. 
 * @author Wesley (Dev 1 — Gatekeeper)
 */
package com.trustus.bank.auth.dto;

public record LoginResponse(
        String token,
        String email,
        String role,
        boolean approved
) {
}
