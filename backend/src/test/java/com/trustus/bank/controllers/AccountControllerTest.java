// Integration tests for account, dashboard, ATM, and directory endpoints.
// @author Darlington (Dev 2 — Teller)
package com.trustus.bank.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trustus.bank.common.enums.AccountType;
import com.trustus.bank.common.enums.RoleType;
import com.trustus.bank.dto.AtmTransactionRequest;
import com.trustus.bank.dto.InternalTransferRequest;
import com.trustus.bank.entities.Account;
import com.trustus.bank.entities.Customer;
import com.trustus.bank.entities.User;
import com.trustus.bank.repositories.AccountRepository;
import com.trustus.bank.repositories.CustomerRepository;
import com.trustus.bank.repositories.UserRepository;
import com.trustus.bank.security.JwtTokenProvider;
import com.trustus.bank.support.TestAuthHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Customer customer;
    private String customerToken;
    private String employeeToken;

    @BeforeEach
    void setUp() {
        User customerUser = userRepository.save(new User(
                "acct.ctrl@example.com",
                passwordEncoder.encode("pass123"),
                RoleType.CUSTOMER
        ));
        customer = customerRepository.save(new Customer(
                customerUser.getId(), "Acct", "Controller", "acct.ctrl@example.com", "131313131", "+31613131313"
        ));
        customer.setApproved(true);
        customer.setDailyTransferLimit(new BigDecimal("5000.00"));
        customer.setAbsoluteTransferLimit(new BigDecimal("10000.00"));
        customerRepository.save(customer);

        Account checking = accountRepository.save(new Account(customer.getId(), AccountType.CHECKING, "NL99INHO0888888888"));
        checking.setBalance(new BigDecimal("1000.00"));
        accountRepository.save(checking);

        Account savings = accountRepository.save(new Account(customer.getId(), AccountType.SAVINGS, "NL99INHO0999999999"));
        savings.setBalance(new BigDecimal("500.00"));
        accountRepository.save(savings);

        userRepository.save(new User(
                "employee.ctrl@trustus.bank",
                passwordEncoder.encode("employee123"),
                RoleType.EMPLOYEE
        ));

        customerToken = TestAuthHelper.bearer(jwtTokenProvider, customer.getEmail(), RoleType.CUSTOMER);
        employeeToken = TestAuthHelper.bearer(jwtTokenProvider, "employee.ctrl@trustus.bank", RoleType.EMPLOYEE);
    }

    @Test
    void getDashboardReturnsAccountsAndCombinedBalance() throws Exception {
        mockMvc.perform(get("/api/customer/dashboard")
                        .header(HttpHeaders.AUTHORIZATION, customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("acct.ctrl@example.com"))
                .andExpect(jsonPath("$.accounts.length()").value(2))
                .andExpect(jsonPath("$.combinedBalance").value(1500.00));
    }

    @Test
    void atmDepositIncreasesBalance() throws Exception {
        mockMvc.perform(post("/api/atm/deposit")
                        .header(HttpHeaders.AUTHORIZATION, customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AtmTransactionRequest(new BigDecimal("250.00")))))
                .andExpect(status().isNoContent());

        Account checking = accountRepository.findByCustomerIdAndType(customer.getId(), AccountType.CHECKING).orElseThrow();
        assertThat(checking.getBalance()).isEqualByComparingTo("1250.00");
    }

    @Test
    void internalTransferViaHttpMovesFunds() throws Exception {
        mockMvc.perform(post("/api/customer/transfers/internal")
                        .header(HttpHeaders.AUTHORIZATION, customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new InternalTransferRequest(AccountType.CHECKING, AccountType.SAVINGS, new BigDecimal("100.00"))
                        )))
                .andExpect(status().isNoContent());

        Account checking = accountRepository.findByCustomerIdAndType(customer.getId(), AccountType.CHECKING).orElseThrow();
        Account savings = accountRepository.findByCustomerIdAndType(customer.getId(), AccountType.SAVINGS).orElseThrow();
        assertThat(checking.getBalance()).isEqualByComparingTo("900.00");
        assertThat(savings.getBalance()).isEqualByComparingTo("600.00");
    }

    @Test
    void searchDirectoryExcludesCaller() throws Exception {
        Customer other = customerRepository.save(new Customer(
                userRepository.save(new User("directory@example.com", "hash", RoleType.CUSTOMER)).getId(),
                "Directory", "Match", "directory@example.com", "141414141", "+31614141414"
        ));
        other.setApproved(true);
        customerRepository.save(other);
        accountRepository.save(new Account(other.getId(), AccountType.CHECKING, "NL99INHO0101010101"));

        mockMvc.perform(get("/api/directory/customers")
                        .header(HttpHeaders.AUTHORIZATION, customerToken)
                        .param("query", "Match"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.email == 'directory@example.com')]").exists())
                .andExpect(jsonPath("$[?(@.email == 'acct.ctrl@example.com')]").doesNotExist());
    }

    @Test
    void listActiveCustomersRequiresEmployeeRole() throws Exception {
        mockMvc.perform(get("/api/employee/customers")
                        .header(HttpHeaders.AUTHORIZATION, employeeToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.email == 'acct.ctrl@example.com')]").exists());
    }
}
