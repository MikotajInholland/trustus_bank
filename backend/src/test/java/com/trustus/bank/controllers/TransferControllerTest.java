// Integration tests for transfer, limit, and transaction history endpoints.
// @author Mikotaj (Dev 3 — Auditor)
package com.trustus.bank.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trustus.bank.common.enums.AccountType;
import com.trustus.bank.common.enums.RoleType;
import com.trustus.bank.dto.ExternalTransferRequest;
import com.trustus.bank.dto.InternalTransferRequest;
import com.trustus.bank.dto.UpdateLimitsRequest;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class TransferControllerTest {

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

    private Customer sender;
    private Customer recipient;
    private Account recipientChecking;
    private String senderToken;
    private String employeeToken;

    @BeforeEach
    void setUp() {
        sender = saveApprovedCustomer("sender.ctrl@example.com", "151515151", "NL99INHO0111222233", "500.00");
        Account senderSavings = new Account(sender.getId(), AccountType.SAVINGS, "NL99INHO0778899900");
        senderSavings.setBalance(new BigDecimal("100.00"));
        accountRepository.save(senderSavings);

        recipient = saveApprovedCustomer("recipient.ctrl@example.com", "161616161", "NL99INHO0444555566", "100.00");
        recipientChecking = accountRepository.findByCustomerIdAndType(recipient.getId(), AccountType.CHECKING).orElseThrow();

        userRepository.save(new User(
                "employee.transfer@trustus.bank",
                passwordEncoder.encode("employee123"),
                RoleType.EMPLOYEE
        ));

        senderToken = TestAuthHelper.bearer(jwtTokenProvider, sender.getEmail(), RoleType.CUSTOMER);
        employeeToken = TestAuthHelper.bearer(jwtTokenProvider, "employee.transfer@trustus.bank", RoleType.EMPLOYEE);
    }

    @Test
    void customerExternalTransferViaHttpMovesFunds() throws Exception {
        mockMvc.perform(post("/api/customer/transfers/external")
                        .header(HttpHeaders.AUTHORIZATION, senderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new ExternalTransferRequest(recipientChecking.getIban(), new BigDecimal("150.00"))
                        )))
                .andExpect(status().isNoContent());

        Account senderChecking = accountRepository.findByCustomerIdAndType(sender.getId(), AccountType.CHECKING).orElseThrow();
        assertThat(senderChecking.getBalance()).isEqualByComparingTo("350.00");
        Account refreshedRecipient = accountRepository.findById(recipientChecking.getId()).orElseThrow();
        assertThat(refreshedRecipient.getBalance()).isEqualByComparingTo("250.00");
    }

    @Test
    void employeeUpdatesLimitsViaHttp() throws Exception {
        mockMvc.perform(put("/api/employee/customers/{customerId}/limits", sender.getId())
                        .header(HttpHeaders.AUTHORIZATION, employeeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new UpdateLimitsRequest(new BigDecimal("600.00"), new BigDecimal("2500.00"))
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dailyTransferLimit").value(600.00))
                .andExpect(jsonPath("$.absoluteTransferLimit").value(2500.00));
    }

    @Test
    void customerTransactionsReturnsHistory() throws Exception {
        mockMvc.perform(post("/api/customer/transfers/internal")
                        .header(HttpHeaders.AUTHORIZATION, senderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new InternalTransferRequest(
                                        AccountType.CHECKING,
                                        AccountType.SAVINGS,
                                        new BigDecimal("25.00")
                                )
                        )))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/customer/transactions")
                        .header(HttpHeaders.AUTHORIZATION, senderToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].amount").value(25.00));
    }

    @Test
    void globalLedgerAsEmployeeReturnsTransactions() throws Exception {
        mockMvc.perform(post("/api/customer/transfers/external")
                        .header(HttpHeaders.AUTHORIZATION, senderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new ExternalTransferRequest(recipientChecking.getIban(), new BigDecimal("10.00"))
                        )))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/employee/ledger")
                        .header(HttpHeaders.AUTHORIZATION, employeeToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void employeeTransferOnBehalfOfCustomer() throws Exception {
        mockMvc.perform(post("/api/employee/customers/{customerId}/transfers", sender.getId())
                        .header(HttpHeaders.AUTHORIZATION, employeeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new ExternalTransferRequest(recipientChecking.getIban(), new BigDecimal("50.00"))
                        )))
                .andExpect(status().isNoContent());

        Account senderChecking = accountRepository.findByCustomerIdAndType(sender.getId(), AccountType.CHECKING).orElseThrow();
        assertThat(senderChecking.getBalance()).isEqualByComparingTo("450.00");
    }

    private Customer saveApprovedCustomer(String email, String bsn, String iban, String balance) {
        User user = userRepository.save(new User(email, passwordEncoder.encode("pass123"), RoleType.CUSTOMER));
        Customer customer = customerRepository.save(new Customer(
                user.getId(), "Transfer", "Ctrl", email, bsn, "+31600000099"
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
}
