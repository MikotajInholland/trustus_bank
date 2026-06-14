/** @summary Approves customers and provisions checking/savings accounts. */
package com.trustus.bank.auth;

import com.trustus.bank.auth.dto.ApprovalRequest;
import com.trustus.bank.auth.dto.CustomerSummaryDto;
import com.trustus.bank.common.exception.ResourceNotFoundException;
import com.trustus.bank.domain.account.Account;
import com.trustus.bank.domain.account.AccountRepository;
import com.trustus.bank.domain.customer.Customer;
import com.trustus.bank.domain.customer.CustomerRepository;
import com.trustus.bank.domain.user.User;
import com.trustus.bank.domain.user.UserRepository;
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
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (customer.isApproved()) {
            throw new com.trustus.bank.common.exception.BusinessRuleException("Customer is already approved");
        }

        customer.setApproved(true);
        customer.setDailyTransferLimit(request.dailyTransferLimit());
        customer.setAbsoluteTransferLimit(request.absoluteTransferLimit());

        createAccountIfMissing(customer, AccountType.CHECKING);
        createAccountIfMissing(customer, AccountType.SAVINGS);

        return new CustomerSummaryDto(
                customer.getId(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getEmail(),
                customer.getPhoneNumber(),
                customer.isApproved()
        );
    }

    @Transactional
    public void closeCustomerAccounts(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        User user = userRepository.findById(customer.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Account> accounts = accountRepository.findByCustomerId(customerId);
        accounts.forEach(account -> account.setActive(false));

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
