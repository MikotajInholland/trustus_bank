/**
 * @summary Persists transfer and ATM transaction ledger entries.
 * @author Mikotaj (Dev 3 — Auditor)
 */
package com.trustus.bank.services;

import com.trustus.bank.common.enums.TransactionType;
import com.trustus.bank.entities.Account;
import com.trustus.bank.entities.Transaction;
import com.trustus.bank.repositories.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    /**


     * @summary Injects the transaction persistence layer.


     */
    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    /**


     * @summary Records a transfer between a customer's own accounts.


     */
    @Transactional
    public Transaction recordInternalTransfer(Account from, Account to, BigDecimal amount, Long userId) {
        return save(from.getId(), to.getId(), amount, userId, TransactionType.INTERNAL_TRANSFER);
    }

    /**


     * @summary Records an external or employee-initiated transfer between accounts.


     */
    @Transactional
    public Transaction recordExternalTransfer(Account from, Account to, BigDecimal amount, Long userId, TransactionType type) {
        return save(from.getId(), to.getId(), amount, userId, type);
    }

    /**


     * @summary Records cash deposited into an account via the ATM.


     */
    @Transactional
    public Transaction recordAtmDeposit(Account to, BigDecimal amount, Long userId) {
        return save(null, to.getId(), amount, userId, TransactionType.ATM_DEPOSIT);
    }

    /**


     * @summary Records cash withdrawn from an account via the ATM.


     */
    @Transactional
    public Transaction recordAtmWithdrawal(Account from, BigDecimal amount, Long userId) {
        return save(from.getId(), null, amount, userId, TransactionType.ATM_WITHDRAWAL);
    }

    /**


     * @summary Creates and persists a new ledger transaction.


     */
    private Transaction save(Long fromId, Long toId, BigDecimal amount, Long userId, TransactionType type) {
        return transactionRepository.save(new Transaction(fromId, toId, amount, userId, type));
    }
}
