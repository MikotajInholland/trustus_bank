/**
 * @summary Validates daily and absolute transfer limits per customer. 
 * @author Mikotaj (Dev 3 — Auditor)
 */
package com.trustus.bank.transfer;

import com.trustus.bank.common.enums.TransactionType;
import com.trustus.bank.common.exception.BusinessRuleException;
import com.trustus.bank.domain.account.Account;
import com.trustus.bank.domain.account.AccountRepository;
import com.trustus.bank.domain.customer.Customer;
import com.trustus.bank.domain.transaction.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class LimitService {

    private static final List<TransactionType> OUTGOING_TYPES = List.of(
            TransactionType.EXTERNAL_TRANSFER,
            TransactionType.EMPLOYEE_TRANSFER,
            TransactionType.ATM_WITHDRAWAL
    );

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public LimitService(TransactionRepository transactionRepository, AccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    public void validateTransferLimits(Customer customer, BigDecimal amount) {
        if (amount.compareTo(customer.getAbsoluteTransferLimit()) > 0) {
            throw new BusinessRuleException("Transfer exceeds absolute limit of "
                    + customer.getAbsoluteTransferLimit() + " EUR");
        }

        BigDecimal dailyTotal = calculateDailyOutgoingTotal(customer.getId());
        if (dailyTotal.add(amount).compareTo(customer.getDailyTransferLimit()) > 0) {
            throw new BusinessRuleException("Transfer exceeds daily limit of "
                    + customer.getDailyTransferLimit() + " EUR (already used "
                    + dailyTotal + " EUR today)");
        }
    }

    public BigDecimal calculateDailyOutgoingTotal(Long customerId) {
        List<Long> accountIds = accountRepository.findByCustomerId(customerId).stream()
                .map(Account::getId)
                .toList();

        if (accountIds.isEmpty()) {
            return BigDecimal.ZERO;
        }

        Instant startOfDay = LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC);
        return transactionRepository.sumOutgoingSince(accountIds, startOfDay, OUTGOING_TYPES);
    }
}
