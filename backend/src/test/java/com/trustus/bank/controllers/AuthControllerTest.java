// Integration tests for login and registration endpoints.
// @author Wesley (Dev 1 — Gatekeeper)
package com.trustus.bank.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trustus.bank.dto.ApprovalRequest;
import com.trustus.bank.dto.LoginRequest;
import com.trustus.bank.dto.RegistrationRequest;
import com.trustus.bank.common.enums.RoleType;
import com.trustus.bank.entities.Customer;
import com.trustus.bank.entities.User;
import com.trustus.bank.repositories.CustomerRepository;
import com.trustus.bank.repositories.UserRepository;
import com.trustus.bank.security.JwtTokenProvider;
import com.trustus.bank.support.TestAuthHelper;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void registerCustomerReturnsCreated() throws Exception {
        RegistrationRequest request = new RegistrationRequest(
                "Jane",
                "Doe",
                "jane.doe@example.com",
                "123456789",
                "+31612345678",
                "password123"
        );

        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("jane.doe@example.com"));
    }

    @Test
    void loginReturnsTokenForValidEmployee() throws Exception {
        userRepository.save(new User(
                "employee@trustus.bank",
                passwordEncoder.encode("employee123"),
                RoleType.EMPLOYEE
        ));

        LoginRequest request = new LoginRequest("employee@trustus.bank", "employee123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("EMPLOYEE"));
    }

    @Test
    void loginRejectsInvalidPassword() throws Exception {
        userRepository.save(new User(
                "bad.login@example.com",
                passwordEncoder.encode("correct"),
                RoleType.EMPLOYEE
        ));

        LoginRequest request = new LoginRequest("bad.login@example.com", "wrong");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void listPendingApprovalsAsEmployee() throws Exception {
        User pendingUser = userRepository.save(new User("pending.http@example.com", "hash", RoleType.CUSTOMER));
        customerRepository.save(new Customer(
                pendingUser.getId(), "Pending", "Http", "pending.http@example.com", "181818181", "+31618181818"
        ));

        userRepository.save(new User(
                "employee.auth@trustus.bank",
                passwordEncoder.encode("employee123"),
                RoleType.EMPLOYEE
        ));
        String employeeToken = TestAuthHelper.bearer(jwtTokenProvider, "employee.auth@trustus.bank", RoleType.EMPLOYEE);

        mockMvc.perform(get("/api/employee/approvals")
                        .header(HttpHeaders.AUTHORIZATION, employeeToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.email == 'pending.http@example.com')]").exists());
    }

    @Test
    void approveCustomerViaHttp() throws Exception {
        User pendingUser = userRepository.save(new User("approve.http@example.com", "hash", RoleType.CUSTOMER));
        Customer pending = customerRepository.save(new Customer(
                pendingUser.getId(), "Approve", "Http", "approve.http@example.com", "191919191", "+31619191919"
        ));

        userRepository.save(new User(
                "employee.approve@trustus.bank",
                passwordEncoder.encode("employee123"),
                RoleType.EMPLOYEE
        ));
        String employeeToken = TestAuthHelper.bearer(jwtTokenProvider, "employee.approve@trustus.bank", RoleType.EMPLOYEE);

        mockMvc.perform(post("/api/employee/approvals/{customerId}", pending.getId())
                        .header(HttpHeaders.AUTHORIZATION, employeeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new ApprovalRequest(new BigDecimal("500.00"), new BigDecimal("2000.00"))
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.approved").value(true));
    }

    @Test
    void closeCustomerViaHttp() throws Exception {
        User user = userRepository.save(new User("close.http@example.com", "hash", RoleType.CUSTOMER));
        Customer customer = customerRepository.save(new Customer(
                user.getId(), "Close", "Http", "close.http@example.com", "202020202", "+31620202020"
        ));
        customer.setApproved(true);
        customerRepository.save(customer);

        userRepository.save(new User(
                "employee.close@trustus.bank",
                passwordEncoder.encode("employee123"),
                RoleType.EMPLOYEE
        ));
        String employeeToken = TestAuthHelper.bearer(jwtTokenProvider, "employee.close@trustus.bank", RoleType.EMPLOYEE);

        mockMvc.perform(post("/api/employee/customers/{customerId}/close", customer.getId())
                        .header(HttpHeaders.AUTHORIZATION, employeeToken))
                .andExpect(status().isNoContent());
    }
}
