package com.trustus.bank.transfer;

import com.trustus.bank.common.exception.BusinessRuleException;
import com.trustus.bank.common.enums.TransactionType;
import com.trustus.bank.domain.customer.Customer;
import com.trustus.bank.domain.transaction.Transaction;
import com.trustus.bank.domain.transaction.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class LimitService {

    private final TransactionRepository transactionRepository;

    public LimitService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public void validateTransferLimits(Customer customer, BigDecimal amount) {
        if (amount.compareTo(customer.getAbsoluteTransferLimit()) > 0) {
            throw new BusinessRuleException("Transfer exceeds absolute limit");
        }

        BigDecimal dailyTotal = calculateDailyOutgoingTotal(customer.getId());
        if (dailyTotal.add(amount).compareTo(customer.getDailyTransferLimit()) > 0) {
            throw new BusinessRuleException("Transfer exceeds daily limit");
        }
    }

    private BigDecimal calculateDailyOutgoingTotal(Long customerId) {
        // TODO: optimize with dedicated query; skeleton uses in-memory filter
        Instant startOfDay = LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC);
        return transactionRepository.findAll().stream()
                .filter(tx -> tx.getTimestamp().isAfter(startOfDay))
                .filter(tx -> isOutgoingTransfer(tx))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private boolean isOutgoingTransfer(Transaction transaction) {
        return transaction.getType() == TransactionType.EXTERNAL_TRANSFER
                || transaction.getType() == TransactionType.EMPLOYEE_TRANSFER
                || transaction.getType() == TransactionType.ATM_WITHDRAWAL;
    }
}
