/** @summary Unit tests for daily and absolute transfer limit checks. */
package com.trustus.bank.transfer;

import com.trustus.bank.common.enums.AccountType;
import com.trustus.bank.common.enums.RoleType;
import com.trustus.bank.common.enums.TransactionType;
import com.trustus.bank.common.exception.BusinessRuleException;
import com.trustus.bank.domain.account.Account;
import com.trustus.bank.domain.account.AccountRepository;
import com.trustus.bank.domain.customer.Customer;
import com.trustus.bank.domain.customer.CustomerRepository;
import com.trustus.bank.domain.transaction.Transaction;
import com.trustus.bank.domain.user.User;
import com.trustus.bank.domain.user.UserRepository;
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
class LimitServiceTest {

    @Autowired
    private LimitService limitService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private com.trustus.bank.domain.transaction.TransactionRepository transactionRepository;

    private Customer customer;
    private Account checking;

    @BeforeEach
    void setUp() {
        User user = userRepository.save(new User("limit.test@example.com", "hash", RoleType.CUSTOMER));
        customer = customerRepository.save(new Customer(
                user.getId(), "Limit", "Tester", "limit.test@example.com", "987654321", "+31600000000"
        ));
        customer.setApproved(true);
        customer.setDailyTransferLimit(new BigDecimal("500.00"));
        customer.setAbsoluteTransferLimit(new BigDecimal("1000.00"));
        customerRepository.save(customer);

        checking = accountRepository.save(new Account(customer.getId(), AccountType.CHECKING, "NL99INHO0123456789"));
    }

    @Test
    void rejectsTransferExceedingAbsoluteLimit() {
        assertThatThrownBy(() -> limitService.validateTransferLimits(customer, new BigDecimal("1500.00")))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("absolute limit");
    }

    @Test
    void rejectsTransferExceedingDailyLimit() {
        transactionRepository.save(new Transaction(
                checking.getId(),
                null,
                new BigDecimal("400.00"),
                customer.getUserId(),
                TransactionType.ATM_WITHDRAWAL
        ));

        assertThatThrownBy(() -> limitService.validateTransferLimits(customer, new BigDecimal("200.00")))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("daily limit");
    }

    @Test
    void allowsTransferWithinLimits() {
        limitService.validateTransferLimits(customer, new BigDecimal("100.00"));
        assertThat(limitService.calculateDailyOutgoingTotal(customer.getId()))
                .isEqualByComparingTo(BigDecimal.ZERO);
    }
}
