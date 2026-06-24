// Persistence queries for users.
// @author Wesley (Dev 1 — Gatekeeper)
package com.trustus.bank.repositories;

import com.trustus.bank.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
