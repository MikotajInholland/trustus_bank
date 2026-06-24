// Persistence queries for transactions.
// @author Mikotaj (Dev 3 — Auditor)
package com.trustus.bank.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.trustus.bank.common.enums.TransactionType;
import com.trustus.bank.entities.Transaction;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Sums outgoing transaction amounts since a given instant for limit enforcement.
    @Query("""
            SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t
            WHERE t.fromAccountId IN :accountIds
              AND t.timestamp >= :since
              AND t.type IN :types
            """)
    BigDecimal sumOutgoingSince(
            @Param("accountIds") List<Long> accountIds,
            @Param("since") Instant since,
            @Param("types") List<TransactionType> types
    );

    // Returns paginated transactions for given accounts with optional date, amount, and IBAN filters.
    @Query("""
            SELECT t FROM Transaction t
            WHERE (t.fromAccountId IN :accountIds OR t.toAccountId IN :accountIds)
              AND (:startDate IS NULL OR t.timestamp >= :startDate)
              AND (:endDate IS NULL OR t.timestamp <= :endDate)
              AND (:minAmount IS NULL OR t.amount >= :minAmount)
              AND (:maxAmount IS NULL OR t.amount <= :maxAmount)
              AND (:exactAmount IS NULL OR t.amount = :exactAmount)
              AND (:ibanAccountIds IS NULL OR t.fromAccountId IN :ibanAccountIds OR t.toAccountId IN :ibanAccountIds)
            ORDER BY t.timestamp DESC
            """)
    Page<Transaction> findFiltered(
            @Param("accountIds") List<Long> accountIds,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            @Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount,
            @Param("exactAmount") BigDecimal exactAmount,
            @Param("ibanAccountIds") List<Long> ibanAccountIds,
            Pageable pageable
    );

    // Returns all transactions ordered by timestamp descending for the global ledger.
    Page<Transaction> findAllByOrderByTimestampDesc(Pageable pageable);
}
