package com.trustus.bank.transfer;

import com.trustus.bank.common.exception.BusinessRuleException;
import com.trustus.bank.domain.customer.Customer;
import com.trustus.bank.domain.transaction.Transaction;
import com.trustus.bank.domain.transaction.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

@Component
public class TransactionRepositoryFacade {

    private final TransactionRepository transactionRepository;

    public TransactionRepositoryFacade(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public Page<Transaction> findAll(Pageable pageable) {
        return transactionRepository.findAllByOrderByTimestampDesc(pageable);
    }

    public Page<Transaction> findFiltered(
            List<Long> accountIds,
            Instant startDate,
            Instant endDate,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            BigDecimal exactAmount,
            Long ibanAccountId,
            Pageable pageable
    ) {
        if (accountIds.isEmpty()) {
            return Page.empty(pageable);
        }
        return transactionRepository.findFiltered(
                accountIds,
                startDate,
                endDate,
                minAmount,
                maxAmount,
                exactAmount,
                ibanAccountId,
                pageable
        );
    }
}
