// Integration tests for dashboard, directory, internal transfers, and ATM operations.
// @author Darlington (Dev 2 — Teller)
package com.trustus.bank.services;

import com.trustus.bank.common.enums.AccountType;
import com.trustus.bank.common.enums.RoleType;
import com.trustus.bank.common.exception.BusinessRuleException;
import com.trustus.bank.dto.AtmTransactionRequest;
import com.trustus.bank.dto.InternalTransferRequest;
import com.trustus.bank.entities.Account;
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
class AccountServiceTest {

    @Autowired
    private AccountService accountService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AccountRepository accountRepository;

    private Customer customer;
    private Account checking;
    private Account savings;

    @BeforeEach
    void setUp() {
        User user = userRepository.save(new User("account.test@example.com", "hash", RoleType.CUSTOMER));
        customer = customerRepository.save(new Customer(
                user.getId(), "Account", "Tester", "account.test@example.com", "111222333", "+31600000001"
        ));
        customer.setApproved(true);
        customer.setDailyTransferLimit(new BigDecimal("5000.00"));
        customer.setAbsoluteTransferLimit(new BigDecimal("10000.00"));
        customerRepository.save(customer);

        checking = accountRepository.save(new Account(customer.getId(), AccountType.CHECKING, "NL99INHO0111111111"));
        checking.setBalance(new BigDecimal("1000.00"));
        accountRepository.save(checking);

        savings = accountRepository.save(new Account(customer.getId(), AccountType.SAVINGS, "NL99INHO0222222222"));
        savings.setBalance(new BigDecimal("2000.00"));
        accountRepository.save(savings);
    }

    @Test
    void internalTransferMovesFundsBetweenOwnAccounts() {
        accountService.internalTransfer(
                customer.getEmail(),
                new InternalTransferRequest(AccountType.CHECKING, AccountType.SAVINGS, new BigDecimal("250.00"))
        );

        assertThat(refresh(checking).getBalance()).isEqualByComparingTo("750.00");
        assertThat(refresh(savings).getBalance()).isEqualByComparingTo("2250.00");
    }

    @Test
    void internalTransferRejectsInsufficientBalance() {
        assertThatThrownBy(() -> accountService.internalTransfer(
                customer.getEmail(),
                new InternalTransferRequest(AccountType.CHECKING, AccountType.SAVINGS, new BigDecimal("1500.00"))
        ))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Insufficient balance");
    }

    @Test
    void atmWithdrawRejectsInsufficientBalance() {
        assertThatThrownBy(() -> accountService.atmWithdraw(
                customer.getEmail(),
                new AtmTransactionRequest(new BigDecimal("1500.00"))
        ))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Insufficient balance");
    }

    @Test
    void atmDepositIncreasesCheckingBalance() {
        accountService.atmDeposit(customer.getEmail(), new AtmTransactionRequest(new BigDecimal("200.00")));

        assertThat(refresh(checking).getBalance()).isEqualByComparingTo("1200.00");
    }

    @Test
    void getDashboardReturnsAccountsAndCombinedBalance() {
        var dashboard = accountService.getDashboardForEmail(customer.getEmail());

        assertThat(dashboard.accounts()).hasSize(2);
        assertThat(dashboard.combinedBalance()).isEqualByComparingTo("3000.00");
        assertThat(dashboard.email()).isEqualTo(customer.getEmail());
    }

    @Test
    void searchDirectoryExcludesCaller() {
        Customer other = customerRepository.save(new Customer(
                userRepository.save(new User("other@example.com", "hash", RoleType.CUSTOMER)).getId(),
                "Other", "Customer", "other@example.com", "999888777", "+31699988877"
        ));
        other.setApproved(true);
        customerRepository.save(other);
        accountRepository.save(new Account(other.getId(), AccountType.CHECKING, "NL99INHO0999999999"));

        var results = accountService.searchDirectory("Customer", customer.getEmail());

        assertThat(results).extracting("email").contains("other@example.com").doesNotContain(customer.getEmail());
    }

    private Account refresh(Account account) {
        return accountRepository.findById(account.getId()).orElseThrow();
    }
}
