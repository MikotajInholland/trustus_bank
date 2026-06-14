package com.trustus.bank.auth;

import com.trustus.bank.auth.dto.ApprovalRequest;
import com.trustus.bank.auth.dto.CustomerSummaryDto;
import com.trustus.bank.auth.dto.LoginRequest;
import com.trustus.bank.auth.dto.LoginResponse;
import com.trustus.bank.auth.dto.RegistrationRequest;
import com.trustus.bank.auth.dto.RegistrationResponse;
import com.trustus.bank.common.dto.PageResponse;
import com.trustus.bank.common.exception.BusinessRuleException;
import com.trustus.bank.common.exception.ResourceNotFoundException;
import com.trustus.bank.common.enums.RoleType;
import com.trustus.bank.domain.customer.Customer;
import com.trustus.bank.domain.customer.CustomerRepository;
import com.trustus.bank.domain.user.User;
import com.trustus.bank.domain.user.UserRepository;
import com.trustus.bank.security.JwtTokenProvider;
import org.springframework.data.domain.Page;
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
    private final CustomerApprovalService customerApprovalService;

    public AuthService(
            UserRepository userRepository,
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            CustomerApprovalService customerApprovalService
    ) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.customerApprovalService = customerApprovalService;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
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

    public PageResponse<CustomerSummaryDto> listPendingApprovals(Pageable pageable) {
        Page<CustomerSummaryDto> page = customerRepository.findByApprovedFalse(pageable)
                .map(this::toSummary);
        return toPageResponse(page);
    }

    @Transactional
    public CustomerSummaryDto approveCustomer(Long customerId, ApprovalRequest request) {
        return customerApprovalService.approveCustomer(customerId, request);
    }

    @Transactional
    public void closeCustomerAccounts(Long customerId) {
        customerApprovalService.closeCustomerAccounts(customerId);
    }

    public CustomerSummaryDto getCustomerById(Long customerId) {
        return customerRepository.findById(customerId)
                .map(this::toSummary)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    private CustomerSummaryDto toSummary(Customer customer) {
        return new CustomerSummaryDto(
                customer.getId(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getEmail(),
                customer.getPhoneNumber(),
                customer.isApproved()
        );
    }

    private <T> PageResponse<T> toPageResponse(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }
}
