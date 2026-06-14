package com.trustus.bank.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trustus.bank.auth.dto.LoginRequest;
import com.trustus.bank.auth.dto.RegistrationRequest;
import com.trustus.bank.common.enums.RoleType;
import com.trustus.bank.domain.user.User;
import com.trustus.bank.domain.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
}
