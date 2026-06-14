package com.trustus.bank.config;

import com.trustus.bank.common.enums.RoleType;
import com.trustus.bank.domain.user.User;
import com.trustus.bank.domain.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    @Profile("!test")
    CommandLineRunner seedDefaultEmployee(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByEmail("employee@trustus.bank")) {
                User employee = new User(
                        "employee@trustus.bank",
                        passwordEncoder.encode("employee123"),
                        RoleType.EMPLOYEE
                );
                userRepository.save(employee);
            }
        };
    }
}
