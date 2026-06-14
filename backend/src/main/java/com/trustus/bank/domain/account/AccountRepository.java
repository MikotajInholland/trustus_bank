/** @summary Persistence queries for accounts. */
package com.trustus.bank.domain.account;

import com.trustus.bank.common.enums.AccountType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {

    List<Account> findByCustomerId(Long customerId);

    List<Account> findByCustomerIdAndActiveTrue(Long customerId);

    Optional<Account> findByIban(String iban);

    Optional<Account> findByCustomerIdAndType(Long customerId, AccountType type);

    boolean existsByIban(String iban);
}
