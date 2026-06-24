// Integration tests for external transfers, limits, and employee transfers.
// @author Mikotaj (Dev 3 — Auditor)
package com.trustus.bank.services;

import com.trustus.bank.common.enums.AccountType;
import com.trustus.bank.common.enums.RoleType;
import com.trustus.bank.common.exception.BusinessRuleException;
import com.trustus.bank.dto.ExternalTransferRequest;
import com.trustus.bank.dto.UpdateLimitsRequest;
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
class TransferServiceTest {

    @Autowired
    private TransferService transferService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AccountRepository accountRepository;

    private Customer sender;
    private Account senderChecking;
    private Account recipientChecking;

    @BeforeEach
    void setUp() {
        sender = saveCustomer("sender.test@example.com", "444555666", "NL99INHO0333333333", "500.00");
        senderChecking = accountRepository.findByCustomerIdAndType(sender.getId(), AccountType.CHECKING).orElseThrow();

        Customer recipient = saveCustomer("recipient.test@example.com", "777888999", "NL99INHO0444444444", "100.00");
        recipientChecking = accountRepository.findByCustomerIdAndType(recipient.getId(), AccountType.CHECKING).orElseThrow();
    }

    @Test
    void customerExternalTransferMovesFundsToAnotherCustomer() {
        transferService.customerExternalTransfer(
                sender.getEmail(),
                new ExternalTransferRequest(recipientChecking.getIban(), new BigDecimal("150.00"))
        );

        assertThat(refresh(senderChecking).getBalance()).isEqualByComparingTo("350.00");
        assertThat(refresh(recipientChecking).getBalance()).isEqualByComparingTo("250.00");
    }

    @Test
    void customerExternalTransferRejectsTransferToOwnAccount() {
        Account senderSavings = accountRepository.save(
                new Account(sender.getId(), AccountType.SAVINGS, "NL99INHO0555555555")
        );

        assertThatThrownBy(() -> transferService.customerExternalTransfer(
                sender.getEmail(),
                new ExternalTransferRequest(senderSavings.getIban(), new BigDecimal("50.00"))
        ))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("own account");
    }

    @Test
    void customerExternalTransferRejectsInsufficientBalance() {
        assertThatThrownBy(() -> transferService.customerExternalTransfer(
                sender.getEmail(),
                new ExternalTransferRequest(recipientChecking.getIban(), new BigDecimal("600.00"))
        ))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Insufficient balance");
    }

    @Test
    void employeeExternalTransferMovesFundsToAnotherCustomer() {
        transferService.employeeExternalTransfer(
                sender.getId(),
                new ExternalTransferRequest(recipientChecking.getIban(), new BigDecimal("100.00"))
        );

        assertThat(refresh(senderChecking).getBalance()).isEqualByComparingTo("400.00");
        assertThat(refresh(recipientChecking).getBalance()).isEqualByComparingTo("200.00");
    }

    @Test
    void updateLimitsPersistsNewValues() {
        var limits = transferService.updateLimits(
                sender.getId(),
                new UpdateLimitsRequest(new BigDecimal("750.00"), new BigDecimal("3000.00"))
        );

        assertThat(limits.dailyTransferLimit()).isEqualByComparingTo("750.00");
        assertThat(limits.absoluteTransferLimit()).isEqualByComparingTo("3000.00");
    }

    @Test
    void getLimitsReturnsCurrentValues() {
        sender.setDailyTransferLimit(new BigDecimal("800.00"));
        sender.setAbsoluteTransferLimit(new BigDecimal("4000.00"));
        customerRepository.save(sender);

        var limits = transferService.getLimits(sender.getId());

        assertThat(limits.dailyTransferLimit()).isEqualByComparingTo("800.00");
        assertThat(limits.absoluteTransferLimit()).isEqualByComparingTo("4000.00");
    }

    private Customer saveCustomer(String email, String bsn, String iban, String balance) {
        User user = userRepository.save(new User(email, "hash", RoleType.CUSTOMER));
        Customer customer = customerRepository.save(new Customer(
                user.getId(), "Transfer", "Tester", email, bsn, "+31600000002"
        ));
        customer.setApproved(true);
        customer.setDailyTransferLimit(new BigDecimal("5000.00"));
        customer.setAbsoluteTransferLimit(new BigDecimal("10000.00"));
        customerRepository.save(customer);

        Account checking = new Account(customer.getId(), AccountType.CHECKING, iban);
        checking.setBalance(new BigDecimal(balance));
        accountRepository.save(checking);

        return customer;
    }

    private Account refresh(Account account) {
        return accountRepository.findById(account.getId()).orElseThrow();
    }
}
