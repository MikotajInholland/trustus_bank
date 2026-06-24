// BCrypt password encoder bean.
// @author Mikotaj (Dev 3 — Auditor)
package com.trustus.bank.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordConfig {

    // Provides a BCrypt password encoder for user credentials.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Binds JWT secret and expiration from application properties.
    @Bean
    public JwtProperties jwtProperties(
            @Value("${trustus.jwt.secret}") String secret,
            @Value("${trustus.jwt.expiration-ms}") long expirationMs
    ) {
        return new JwtProperties(secret, expirationMs);
    }

    // Holds JWT signing secret and token lifetime configuration.
    public record JwtProperties(String secret, long expirationMs) {
    }
}
