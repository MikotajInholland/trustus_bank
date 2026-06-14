/**
 * @summary Persists transfer and ATM transaction ledger entries.
 * @author Mikotaj (Dev 3 — Auditor)
 */
package com.trustus.bank.transfer;

import com.trustus.bank.common.enums.TransactionType;
import com.trustus.bank.domain.account.Account;
import com.trustus.bank.domain.transaction.Transaction;
import com.trustus.bank.domain.transaction.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public Transaction recordInternalTransfer(Account from, Account to, BigDecimal amount, Long userId) {
        return save(from.getId(), to.getId(), amount, userId, TransactionType.INTERNAL_TRANSFER);
    }

    @Transactional
    public Transaction recordExternalTransfer(Account from, Account to, BigDecimal amount, Long userId, TransactionType type) {
        return save(from.getId(), to.getId(), amount, userId, type);
    }

    @Transactional
    public Transaction recordAtmDeposit(Account to, BigDecimal amount, Long userId) {
        return save(null, to.getId(), amount, userId, TransactionType.ATM_DEPOSIT);
    }

    @Transactional
    public Transaction recordAtmWithdrawal(Account from, BigDecimal amount, Long userId) {
        return save(from.getId(), null, amount, userId, TransactionType.ATM_WITHDRAWAL);
    }

    private Transaction save(Long fromId, Long toId, BigDecimal amount, Long userId, TransactionType type) {
        return transactionRepository.save(new Transaction(fromId, toId, amount, userId, type));
    }
}
