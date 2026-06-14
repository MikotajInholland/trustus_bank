/** @summary BCrypt password encoder bean. */
package com.trustus.bank.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtProperties jwtProperties(
            @Value("${trustus.jwt.secret}") String secret,
            @Value("${trustus.jwt.expiration-ms}") long expirationMs
    ) {
        return new JwtProperties(secret, expirationMs);
    }

    public record JwtProperties(String secret, long expirationMs) {
    }
}
