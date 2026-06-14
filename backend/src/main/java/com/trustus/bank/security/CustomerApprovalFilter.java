/** @summary Blocks unapproved customers from customer and ATM routes. */
package com.trustus.bank.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trustus.bank.domain.customer.Customer;
import com.trustus.bank.domain.customer.CustomerRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

/**
 * Wesley (Dev 1 — Gatekeeper): blocks unapproved customers from banking endpoints.
 */
@Component
public class CustomerApprovalFilter extends OncePerRequestFilter {

    private final CustomerRepository customerRepository;
    private final ObjectMapper objectMapper;

    public CustomerApprovalFilter(CustomerRepository customerRepository, ObjectMapper objectMapper) {
        this.customerRepository = customerRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String path = request.getRequestURI();

        if (authentication != null
                && authentication.isAuthenticated()
                && isCustomer(authentication)
                && requiresApproval(path)) {

            Customer customer = customerRepository.findByEmail(authentication.getName()).orElse(null);
            if (customer == null || !customer.isApproved()) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                objectMapper.writeValue(response.getWriter(), Map.of(
                        "message", "Your account is pending employee approval"
                ));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isCustomer(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_CUSTOMER".equals(authority.getAuthority()));
    }

    private boolean requiresApproval(String path) {
        return path.startsWith("/api/customer/") || path.startsWith("/api/atm/");
    }
}
