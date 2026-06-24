// Integration tests for registration, login, and pending approval listing.
// @author Wesley (Dev 1 — Gatekeeper)
package com.trustus.bank.services;

import com.trustus.bank.common.enums.RoleType;
import com.trustus.bank.common.exception.BusinessRuleException;
import com.trustus.bank.dto.LoginRequest;
import com.trustus.bank.dto.RegistrationRequest;
import com.trustus.bank.entities.Customer;
import com.trustus.bank.entities.User;
import com.trustus.bank.repositories.CustomerRepository;
import com.trustus.bank.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void registerRejectsDuplicateEmail() {
        authService.register(new RegistrationRequest(
                "Jane", "Doe", "duplicate@example.com", "123456789", "+31612345678", "password123"
        ));

        assertThatThrownBy(() -> authService.register(new RegistrationRequest(
                "John", "Doe", "duplicate@example.com", "987654321", "+31687654321", "password456"
        )))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Email is already registered");
    }

    @Test
    void loginMarksUnapprovedCustomerAsNotApproved() {
        User user = userRepository.save(new User(
                "pending@example.com",
                passwordEncoder.encode("secret123"),
                RoleType.CUSTOMER
        ));
        customerRepository.save(new Customer(
                user.getId(), "Pending", "User", "pending@example.com", "555666777", "+31655566677"
        ));

        var response = authService.login(new LoginRequest("pending@example.com", "secret123"));

        assertThat(response.token()).isNotBlank();
        assertThat(response.approved()).isFalse();
    }

    @Test
    void registerRejectsDuplicateBsn() {
        authService.register(new RegistrationRequest(
                "Jane", "Doe", "jane.bsn@example.com", "123456789", "+31612345678", "password123"
        ));

        assertThatThrownBy(() -> authService.register(new RegistrationRequest(
                "John", "Doe", "john.bsn@example.com", "123456789", "+31687654321", "password456"
        )))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("BSN is already registered");
    }

    @Test
    void loginRejectsInvalidPassword() {
        userRepository.save(new User(
                "wrong.pass@example.com",
                passwordEncoder.encode("correct"),
                RoleType.EMPLOYEE
        ));

        assertThatThrownBy(() -> authService.login(new LoginRequest("wrong.pass@example.com", "incorrect")))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void listPendingApprovalsReturnsUnapprovedCustomersOnly() {
        User pendingUser = userRepository.save(new User("awaiting@example.com", "hash", RoleType.CUSTOMER));
        customerRepository.save(new Customer(
                pendingUser.getId(), "Awaiting", "Approval", "awaiting@example.com", "112233445", "+31611223344"
        ));

        User approvedUser = userRepository.save(new User("approved@example.com", "hash", RoleType.CUSTOMER));
        Customer approved = customerRepository.save(new Customer(
                approvedUser.getId(), "Already", "Approved", "approved@example.com", "554433221", "+31655443322"
        ));
        approved.setApproved(true);
        customerRepository.save(approved);

        var page = authService.listPendingApprovals(PageRequest.of(0, 20), null);

        assertThat(page.content()).extracting("email").contains("awaiting@example.com").doesNotContain("approved@example.com");
    }
}
