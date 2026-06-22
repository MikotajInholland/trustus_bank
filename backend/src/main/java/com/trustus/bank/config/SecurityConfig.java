/**
 * @summary HTTP security filter chain and route authorization rules.
 * @author Mikotaj (Dev 3 — Auditor)
 */
package com.trustus.bank.config;

import com.trustus.bank.security.CustomerApprovalFilter;
import com.trustus.bank.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomerApprovalFilter customerApprovalFilter;

    /**
     * @summary Injects JWT and customer-approval security filters.
     */
    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            CustomerApprovalFilter customerApprovalFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.customerApprovalFilter = customerApprovalFilter;
    }

    /**
     * @summary Configures stateless JWT auth and role-based API access rules.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/register",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/api-docs/**",
                                "/h2-console/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/health").permitAll()
                        .requestMatchers("/api/employee/**").hasRole("EMPLOYEE")
                        .requestMatchers("/api/customer/**").hasAnyRole("CUSTOMER", "EMPLOYEE")
                        .anyRequest().authenticated()
                )
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(customerApprovalFilter, JwtAuthenticationFilter.class);

        return http.build();
    }
}
