package com.trustus.bank.domain.transaction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("""
            SELECT t FROM Transaction t
            WHERE (t.fromAccountId IN :accountIds OR t.toAccountId IN :accountIds)
              AND (:startDate IS NULL OR t.timestamp >= :startDate)
              AND (:endDate IS NULL OR t.timestamp <= :endDate)
              AND (:minAmount IS NULL OR t.amount >= :minAmount)
              AND (:maxAmount IS NULL OR t.amount <= :maxAmount)
              AND (:exactAmount IS NULL OR t.amount = :exactAmount)
              AND (:ibanAccountId IS NULL OR t.fromAccountId = :ibanAccountId OR t.toAccountId = :ibanAccountId)
            ORDER BY t.timestamp DESC
            """)
    Page<Transaction> findFiltered(
            @Param("accountIds") List<Long> accountIds,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            @Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount,
            @Param("exactAmount") BigDecimal exactAmount,
            @Param("ibanAccountId") Long ibanAccountId,
            Pageable pageable
    );

    Page<Transaction> findAllByOrderByTimestampDesc(Pageable pageable);
}
