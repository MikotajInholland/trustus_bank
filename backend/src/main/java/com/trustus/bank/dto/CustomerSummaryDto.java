/**
 * @summary Summary of a customer for employee list views.
 * @author Wesley (Dev 1 — Gatekeeper)
 */
package com.trustus.bank.dto;

import com.trustus.bank.entities.Customer;

public record CustomerSummaryDto(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        boolean approved
) {
    public static CustomerSummaryDto from(Customer customer) {
        return new CustomerSummaryDto(
                customer.getId(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getEmail(),
                customer.getPhoneNumber(),
                customer.isApproved()
        );
    }
}
