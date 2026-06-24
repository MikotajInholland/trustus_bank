// Integration tests for transaction history and global ledger queries.
// @author Mikotaj (Dev 3 — Auditor)
package com.trustus.bank.services;

import com.trustus.bank.common.enums.AccountType;
import com.trustus.bank.common.enums.RoleType;
import com.trustus.bank.dto.InternalTransferRequest;
import com.trustus.bank.dto.TransactionFilters;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TransactionServiceTest {

    @Autowired
    private TransactionService transactionService;

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

    @BeforeEach
    void setUp() {
        User user = userRepository.save(new User("txn.test@example.com", "hash", RoleType.CUSTOMER));
        customer = customerRepository.save(new Customer(
                user.getId(), "Txn", "Tester", "txn.test@example.com", "121212121", "+31612121212"
        ));
        customer.setApproved(true);
        customer.setDailyTransferLimit(new BigDecimal("5000.00"));
        customer.setAbsoluteTransferLimit(new BigDecimal("10000.00"));
        customerRepository.save(customer);

        checking = accountRepository.save(new Account(customer.getId(), AccountType.CHECKING, "NL99INHO0666666666"));
        checking.setBalance(new BigDecimal("1000.00"));
        accountRepository.save(checking);

        Account savings = accountRepository.save(new Account(customer.getId(), AccountType.SAVINGS, "NL99INHO0777777777"));
        savings.setBalance(new BigDecimal("500.00"));
        accountRepository.save(savings);
    }

    @Test
    void getHistoryForCustomerReturnsRecordedTransactions() {
        accountService.internalTransfer(
                customer.getEmail(),
                new InternalTransferRequest(AccountType.CHECKING, AccountType.SAVINGS, new BigDecimal("100.00"))
        );

        var history = transactionService.getHistoryForCustomer(
                customer,
                new TransactionFilters(null, null, null, null, null, null),
                PageRequest.of(0, 20)
        );

        assertThat(history.content()).hasSize(1);
        assertThat(history.content().get(0).amount()).isEqualByComparingTo("100.00");
    }

    @Test
    void getHistoryFiltersByExactAmount() {
        accountService.internalTransfer(
                customer.getEmail(),
                new InternalTransferRequest(AccountType.CHECKING, AccountType.SAVINGS, new BigDecimal("100.00"))
        );
        accountService.internalTransfer(
                customer.getEmail(),
                new InternalTransferRequest(AccountType.CHECKING, AccountType.SAVINGS, new BigDecimal("50.00"))
        );

        var history = transactionService.getHistoryForCustomer(
                customer,
                new TransactionFilters(null, null, null, null, new BigDecimal("50.00"), null),
                PageRequest.of(0, 20)
        );

        assertThat(history.content()).hasSize(1);
        assertThat(history.content().get(0).amount()).isEqualByComparingTo("50.00");
    }

    @Test
    void getGlobalLedgerReturnsAllTransactions() {
        accountService.internalTransfer(
                customer.getEmail(),
                new InternalTransferRequest(AccountType.CHECKING, AccountType.SAVINGS, new BigDecimal("75.00"))
        );

        var ledger = transactionService.getGlobalLedger(PageRequest.of(0, 50));

        assertThat(ledger.content()).isNotEmpty();
        assertThat(ledger.totalElements()).isGreaterThanOrEqualTo(1);
    }
}
