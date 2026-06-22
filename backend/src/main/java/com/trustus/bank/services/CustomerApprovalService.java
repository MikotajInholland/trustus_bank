/**
 * @summary Approves customers and provisions checking/savings accounts.
 * @author Wesley (Dev 1 — Gatekeeper)
 */
package com.trustus.bank.services;

import com.trustus.bank.dto.ApprovalRequest;
import com.trustus.bank.dto.CustomerSummaryDto;
import com.trustus.bank.common.exception.BusinessRuleException;
import com.trustus.bank.common.exception.ResourceNotFoundException;
import com.trustus.bank.entities.Account;
import com.trustus.bank.repositories.AccountRepository;
import com.trustus.bank.entities.Customer;
import com.trustus.bank.repositories.CustomerRepository;
import com.trustus.bank.entities.User;
import com.trustus.bank.repositories.UserRepository;
import com.trustus.bank.common.enums.AccountType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

@Service
public class CustomerApprovalService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final String bankCode;

    public CustomerApprovalService(
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            UserRepository userRepository,
            @Value("${trustus.iban.bank-code}") String bankCode
    ) {
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.bankCode = bankCode;
    }

    @Transactional
    public CustomerSummaryDto approveCustomer(Long customerId, ApprovalRequest request) {
        Customer customer = customerRepository.requireById(customerId);

        if (customer.isApproved()) {
            throw new BusinessRuleException("Customer is already approved");
        }

        customer.setApproved(true);
        customer.setDailyTransferLimit(request.dailyTransferLimit());
        customer.setAbsoluteTransferLimit(request.absoluteTransferLimit());

        createAccountIfMissing(customer, AccountType.CHECKING);
        createAccountIfMissing(customer, AccountType.SAVINGS);

        return CustomerSummaryDto.from(customer);
    }

    @Transactional
    public void closeCustomerAccounts(Long customerId) {
        Customer customer = customerRepository.requireById(customerId);

        User user = userRepository.findById(customer.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        accountRepository.findByCustomerId(customerId).forEach(account -> account.setActive(false));
        user.setEnabled(false);
        customer.setApproved(false);
    }

    private void createAccountIfMissing(Customer customer, AccountType type) {
        accountRepository.findByCustomerIdAndType(customer.getId(), type)
                .orElseGet(() -> accountRepository.save(new Account(customer.getId(), type, generateIban())));
    }

    private String generateIban() {
        String checkDigits = String.format("%02d", RANDOM.nextInt(100));
        String accountNumber = String.format("%09d", RANDOM.nextInt(1_000_000_000));
        String iban = "NL" + checkDigits + bankCode + "0" + accountNumber;
        while (accountRepository.existsByIban(iban)) {
            accountNumber = String.format("%09d", RANDOM.nextInt(1_000_000_000));
            iban = "NL" + checkDigits + bankCode + "0" + accountNumber;
        }
        return iban;
    }
}
