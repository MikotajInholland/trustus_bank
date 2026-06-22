/**
 * @summary Login, registration, and pending approval listing.
 * @author Wesley (Dev 1 — Gatekeeper)
 */
package com.trustus.bank.services;

import com.trustus.bank.dto.CustomerSummaryDto;
import com.trustus.bank.dto.LoginRequest;
import com.trustus.bank.dto.LoginResponse;
import com.trustus.bank.dto.RegistrationRequest;
import com.trustus.bank.dto.RegistrationResponse;
import com.trustus.bank.common.dto.PageResponse;
import com.trustus.bank.common.exception.BusinessRuleException;
import com.trustus.bank.common.enums.RoleType;
import com.trustus.bank.entities.Customer;
import com.trustus.bank.repositories.CustomerRepository;
import com.trustus.bank.entities.User;
import com.trustus.bank.repositories.UserRepository;
import com.trustus.bank.security.JwtTokenProvider;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(
            UserRepository userRepository,
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider
    ) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessRuleException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BusinessRuleException("Invalid email or password");
        }

        boolean approved = user.getRole() != RoleType.CUSTOMER
                || customerRepository.findByUserId(user.getId()).map(Customer::isApproved).orElse(false);

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());
        return new LoginResponse(token, user.getEmail(), user.getRole().name(), approved);
    }

    @Transactional
    public RegistrationResponse register(RegistrationRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessRuleException("Email is already registered");
        }
        if (customerRepository.existsByBsn(request.bsn())) {
            throw new BusinessRuleException("BSN is already registered");
        }

        User user = new User(request.email(), passwordEncoder.encode(request.password()), RoleType.CUSTOMER);
        userRepository.save(user);

        Customer customer = new Customer(
                user.getId(),
                request.firstName(),
                request.lastName(),
                request.email(),
                request.bsn(),
                request.phoneNumber()
        );
        customerRepository.save(customer);

        return new RegistrationResponse(
                customer.getId(),
                customer.getEmail(),
                "Registration successful. Please wait for employee approval."
        );
    }

    public PageResponse<CustomerSummaryDto> listPendingApprovals(Pageable pageable, String search) {
        return PageResponse.from(
                customerRepository.findByApprovedAndSearch(false, normalizeSearch(search), pageable),
                CustomerSummaryDto::from
        );
    }

    private String normalizeSearch(String search) {
        return search == null || search.isBlank() ? null : search.trim();
    }
}
