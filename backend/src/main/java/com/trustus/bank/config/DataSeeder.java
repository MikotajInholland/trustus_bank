// Seeds demo employee and customer accounts on startup.
// @author Mikotaj (Dev 3 — Auditor)
package com.trustus.bank.config;

import com.trustus.bank.common.enums.AccountType;
import com.trustus.bank.common.enums.RoleType;
import com.trustus.bank.common.enums.TransactionType;
import com.trustus.bank.entities.Account;
import com.trustus.bank.repositories.AccountRepository;
import com.trustus.bank.entities.Customer;
import com.trustus.bank.repositories.CustomerRepository;
import com.trustus.bank.entities.Transaction;
import com.trustus.bank.repositories.TransactionRepository;
import com.trustus.bank.entities.User;
import com.trustus.bank.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class DataSeeder {

    public static final String DEMO_EMPLOYEE_EMAIL = "employee@trustus.bank";
    public static final String DEMO_EMPLOYEE_PASSWORD = "employee123";
    public static final String DEMO_CUSTOMER_PASSWORD = "customer123";

    private static final BigDecimal DEMO_DAILY_LIMIT = new BigDecimal("1000.00");
    private static final BigDecimal DEMO_ABSOLUTE_LIMIT = new BigDecimal("5000.00");
    private static final BigDecimal DEMO_CHECKING_BALANCE = new BigDecimal("2500.00");
    private static final BigDecimal DEMO_SAVINGS_BALANCE = new BigDecimal("5000.00");
    private static final int DEMO_TRANSACTIONS_PER_CUSTOMER = 25;

    // Seeds demo users, customers, accounts, and transfer limits on startup.
    @Bean
    @Profile("!test")
    CommandLineRunner seedDemoData(
            UserRepository userRepository,
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            seedEmployee(userRepository, passwordEncoder);
            seedDemoCustomer(userRepository, customerRepository, accountRepository, passwordEncoder,
                    "Wesley", "van der Kleij", "wesley@trustus.bank", "123456789", "+31611111111",
                    "NL11INHO0100000001", "NL11INHO0200000001");
            seedDemoCustomer(userRepository, customerRepository, accountRepository, passwordEncoder,
                    "Darlington", "Jones", "darlington@trustus.bank", "234567890", "+31622222222",
                    "NL12INHO0100000002", "NL12INHO0200000002");
            seedDemoCustomer(userRepository, customerRepository, accountRepository, passwordEncoder,
                    "Mikotaj", "Ignatowski", "mikotaj@trustus.bank", "345678901", "+31633333333",
                    "NL13INHO0100000003", "NL13INHO0200000003");
            seedDemoTransactions(customerRepository, accountRepository, transactionRepository);
        };
    }

    // Creates or updates the demo employee account.
    private void seedEmployee(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        User employee = userRepository.findByEmail(DEMO_EMPLOYEE_EMAIL)
                .orElseGet(() -> new User(DEMO_EMPLOYEE_EMAIL, "", RoleType.EMPLOYEE));

        employee.setPassword(passwordEncoder.encode(DEMO_EMPLOYEE_PASSWORD));
        employee.setRole(RoleType.EMPLOYEE);
        employee.setEnabled(true);
        userRepository.save(employee);
    }

    // Creates or updates a demo customer with checking and savings accounts.
    private void seedDemoCustomer(
            UserRepository userRepository,
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            PasswordEncoder passwordEncoder,
            String firstName,
            String lastName,
            String email,
            String bsn,
            String phoneNumber,
            String checkingIban,
            String savingsIban
    ) {
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> new User(email, "", RoleType.CUSTOMER));

        user.setPassword(passwordEncoder.encode(DEMO_CUSTOMER_PASSWORD));
        user.setRole(RoleType.CUSTOMER);
        user.setEnabled(true);
        userRepository.save(user);

        Customer customer = customerRepository.findByEmail(email)
                .orElseGet(() -> new Customer(user.getId(), firstName, lastName, email, bsn, phoneNumber));

        customer.setFirstName(firstName);
        customer.setLastName(lastName);
        customer.setApproved(true);
        customer.setDailyTransferLimit(DEMO_DAILY_LIMIT);
        customer.setAbsoluteTransferLimit(DEMO_ABSOLUTE_LIMIT);
        customerRepository.save(customer);

        upsertAccount(accountRepository, customer.getId(), AccountType.CHECKING, checkingIban, DEMO_CHECKING_BALANCE);
        upsertAccount(accountRepository, customer.getId(), AccountType.SAVINGS, savingsIban, DEMO_SAVINGS_BALANCE);
    }

    // Creates or updates a single account with the given IBAN and balance.
    private void upsertAccount(
            AccountRepository accountRepository,
            Long customerId,
            AccountType type,
            String iban,
            BigDecimal balance
    ) {
        Account account = accountRepository.findByCustomerIdAndType(customerId, type)
                .orElseGet(() -> new Account(customerId, type, iban));

        account.setBalance(balance);
        account.setActive(true);
        accountRepository.save(account);
    }

    // Seeds demo ledger entries so transaction history pagination can be tested immediately.
    private void seedDemoTransactions(
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository
    ) {
        if (transactionRepository.count() > 0) {
            return;
        }

        List<CustomerAccounts> customers = List.of(
                loadCustomerAccounts(customerRepository, accountRepository, "wesley@trustus.bank"),
                loadCustomerAccounts(customerRepository, accountRepository, "darlington@trustus.bank"),
                loadCustomerAccounts(customerRepository, accountRepository, "mikotaj@trustus.bank")
        );

        List<Transaction> transactions = new ArrayList<>();
        for (int customerIndex = 0; customerIndex < customers.size(); customerIndex++) {
            CustomerAccounts current = customers.get(customerIndex);
            Account recipientChecking = customers.get((customerIndex + 1) % customers.size()).checking();

            for (int i = 0; i < DEMO_TRANSACTIONS_PER_CUSTOMER; i++) {
                transactions.add(buildDemoTransaction(current, recipientChecking, customerIndex, i));
            }
        }

        transactionRepository.saveAll(transactions);
    }

    private CustomerAccounts loadCustomerAccounts(
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            String email
    ) {
        Customer customer = customerRepository.requireByEmail(email);
        Account checking = accountRepository.findByCustomerIdAndType(customer.getId(), AccountType.CHECKING)
                .orElseThrow();
        Account savings = accountRepository.findByCustomerIdAndType(customer.getId(), AccountType.SAVINGS)
                .orElseThrow();
        return new CustomerAccounts(customer, checking, savings);
    }

    private Transaction buildDemoTransaction(
            CustomerAccounts customerAccounts,
            Account recipientChecking,
            int customerIndex,
            int sequence
    ) {
        Account checking = customerAccounts.checking();
        Account savings = customerAccounts.savings();
        Long userId = customerAccounts.customer().getUserId();
        BigDecimal amount = new BigDecimal("10.00").add(new BigDecimal(sequence));
        Instant timestamp = Instant.now()
                .minus(Duration.ofDays(sequence))
                .minus(Duration.ofHours(customerIndex * 3L + sequence));

        Transaction transaction = switch (sequence % 5) {
            case 0 -> new Transaction(
                    checking.getId(), savings.getId(), amount, userId, TransactionType.INTERNAL_TRANSFER
            );
            case 1 -> new Transaction(
                    savings.getId(), checking.getId(), amount, userId, TransactionType.INTERNAL_TRANSFER
            );
            case 2 -> new Transaction(
                    null, checking.getId(), amount, userId, TransactionType.ATM_DEPOSIT
            );
            case 3 -> new Transaction(
                    checking.getId(), null, amount, userId, TransactionType.ATM_WITHDRAWAL
            );
            default -> new Transaction(
                    checking.getId(),
                    recipientChecking.getId(),
                    amount,
                    userId,
                    TransactionType.EXTERNAL_TRANSFER
            );
        };

        transaction.setTimestamp(timestamp);
        return transaction;
    }

    private record CustomerAccounts(Customer customer, Account checking, Account savings) {
    }
}
