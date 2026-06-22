/**
 * @summary Persistence queries for customers including search.
 * @author Wesley (Dev 1 — Gatekeeper)
 */
package com.trustus.bank.repositories;

import com.trustus.bank.entities.Customer;
import com.trustus.bank.common.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByEmail(String email);

    Optional<Customer> findByUserId(Long userId);

    boolean existsByEmail(String email);

    boolean existsByBsn(String bsn);

    default Customer requireById(Long id) {
        return findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    default Customer requireByEmail(String email) {
        return findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    @Query("""
            SELECT c FROM Customer c
            WHERE c.approved = :approved
              AND (:search IS NULL OR :search = ''
                   OR LOWER(c.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(c.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(CONCAT(c.firstName, ' ', c.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Customer> findByApprovedAndSearch(
            @Param("approved") boolean approved,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
            SELECT c FROM Customer c
            WHERE c.approved = true
              AND (LOWER(c.firstName) LIKE LOWER(CONCAT('%', :query, '%'))
               OR LOWER(c.lastName) LIKE LOWER(CONCAT('%', :query, '%'))
               OR LOWER(CONCAT(c.firstName, ' ', c.lastName)) LIKE LOWER(CONCAT('%', :query, '%')))
            """)
    List<Customer> searchByName(@Param("query") String query);
}
