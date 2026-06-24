// Integration tests for employee customer approval and account closure.
// @author Wesley (Dev 1 — Gatekeeper)
package com.trustus.bank.services;

import com.trustus.bank.common.enums.AccountType;
import com.trustus.bank.common.enums.RoleType;
import com.trustus.bank.common.exception.BusinessRuleException;
import com.trustus.bank.dto.ApprovalRequest;
import com.trustus.bank.entities.Customer;
import com.trustus.bank.entities.User;
import com.trustus.bank.repositories.AccountRepository;
import com.trustus.bank.repositories.CustomerRepository;
import com.trustus.bank.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CustomerApprovalServiceTest {

    @Autowired
    private CustomerApprovalService customerApprovalService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AccountRepository accountRepository;

    private Customer pendingCustomer;

    @BeforeEach
    void setUp() {
        User user = userRepository.save(new User("pending.approval@example.com", "hash", RoleType.CUSTOMER));
        pendingCustomer = customerRepository.save(new Customer(
                user.getId(), "Pending", "Approval", "pending.approval@example.com", "333444555", "+31633344455"
        ));
    }

    @Test
    void approveCustomerCreatesAccountsAndSetsLimits() {
        var summary = customerApprovalService.approveCustomer(
                pendingCustomer.getId(),
                new ApprovalRequest(new BigDecimal("500.00"), new BigDecimal("2000.00"))
        );

        assertThat(summary.approved()).isTrue();
        assertThat(accountRepository.findByCustomerIdAndType(pendingCustomer.getId(), AccountType.CHECKING)).isPresent();
        assertThat(accountRepository.findByCustomerIdAndType(pendingCustomer.getId(), AccountType.SAVINGS)).isPresent();

        Customer updated = customerRepository.findById(pendingCustomer.getId()).orElseThrow();
        assertThat(updated.getDailyTransferLimit()).isEqualByComparingTo("500.00");
        assertThat(updated.getAbsoluteTransferLimit()).isEqualByComparingTo("2000.00");
    }

    @Test
    void approveCustomerRejectsAlreadyApprovedCustomer() {
        customerApprovalService.approveCustomer(
                pendingCustomer.getId(),
                new ApprovalRequest(new BigDecimal("500.00"), new BigDecimal("2000.00"))
        );

        assertThatThrownBy(() -> customerApprovalService.approveCustomer(
                pendingCustomer.getId(),
                new ApprovalRequest(new BigDecimal("600.00"), new BigDecimal("3000.00"))
        ))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("already approved");
    }

    @Test
    void closeCustomerAccountsDeactivatesAccountsAndUser() {
        customerApprovalService.approveCustomer(
                pendingCustomer.getId(),
                new ApprovalRequest(new BigDecimal("500.00"), new BigDecimal("2000.00"))
        );

        customerApprovalService.closeCustomerAccounts(pendingCustomer.getId());

        User user = userRepository.findById(pendingCustomer.getUserId()).orElseThrow();
        Customer customer = customerRepository.findById(pendingCustomer.getId()).orElseThrow();

        assertThat(user.isEnabled()).isFalse();
        assertThat(customer.isApproved()).isFalse();
        assertThat(accountRepository.findByCustomerId(pendingCustomer.getId()))
                .allMatch(account -> !account.isActive());
    }
}
