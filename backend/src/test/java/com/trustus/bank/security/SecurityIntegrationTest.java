// Integration tests for JWT auth, role checks, and customer approval filter.
// @author Wesley (Dev 1 — Gatekeeper)
package com.trustus.bank.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trustus.bank.common.enums.RoleType;
import com.trustus.bank.dto.AtmTransactionRequest;
import com.trustus.bank.entities.Customer;
import com.trustus.bank.entities.User;
import com.trustus.bank.repositories.CustomerRepository;
import com.trustus.bank.repositories.UserRepository;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SecurityIntegrationTest {

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
    private PasswordEncoder passwordEncoder;

    private String unapprovedCustomerToken;

    @BeforeEach
    void setUp() {
        User user = userRepository.save(new User(
                "unapproved@example.com",
                passwordEncoder.encode("pass123"),
                RoleType.CUSTOMER
        ));
        customerRepository.save(new Customer(
                user.getId(), "Unapproved", "Customer", "unapproved@example.com", "171717171", "+31617171717"
        ));
        unapprovedCustomerToken = TestAuthHelper.bearer(jwtTokenProvider, "unapproved@example.com", RoleType.CUSTOMER);
    }

    @Test
    void unapprovedCustomerGetsForbiddenOnDashboard() throws Exception {
        mockMvc.perform(get("/api/customer/dashboard")
                        .header(HttpHeaders.AUTHORIZATION, unapprovedCustomerToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Your account is pending employee approval"));
    }

    @Test
    void unapprovedCustomerGetsForbiddenOnAtm() throws Exception {
        mockMvc.perform(post("/api/atm/withdraw")
                        .header(HttpHeaders.AUTHORIZATION, unapprovedCustomerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AtmTransactionRequest(new BigDecimal("10.00")))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Your account is pending employee approval"));
    }

    @Test
    void employeeEndpointRejectsCustomerToken() throws Exception {
        mockMvc.perform(get("/api/employee/approvals")
                        .header(HttpHeaders.AUTHORIZATION, unapprovedCustomerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void protectedEndpointRejectsMissingToken() throws Exception {
        mockMvc.perform(get("/api/customer/dashboard"))
                .andExpect(status().isForbidden());
    }
}
