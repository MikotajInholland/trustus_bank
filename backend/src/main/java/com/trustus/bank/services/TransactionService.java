// Records transactions and serves transaction history.
// @author Mikotaj (Dev 3 — Auditor)
package com.trustus.bank.services;

import com.trustus.bank.common.BankConstants;
import com.trustus.bank.common.dto.PageResponse;
import com.trustus.bank.common.enums.TransactionType;
import com.trustus.bank.dto.TransactionDto;
import com.trustus.bank.dto.TransactionFilters;
import com.trustus.bank.entities.Account;
import com.trustus.bank.entities.Customer;
import com.trustus.bank.entities.Transaction;
import com.trustus.bank.repositories.AccountRepository;
import com.trustus.bank.repositories.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public TransactionService(TransactionRepository transactionRepository, AccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    @Transactional
    public void recordInternalTransfer(Account from, Account to, BigDecimal amount, Long userId) {
        save(from.getId(), to.getId(), amount, userId, TransactionType.INTERNAL_TRANSFER);
    }

    @Transactional
    public void recordExternalTransfer(Account from, Account to, BigDecimal amount, Long userId, TransactionType type) {
        save(from.getId(), to.getId(), amount, userId, type);
    }

    @Transactional
    public void recordAtmDeposit(Account to, BigDecimal amount, Long userId) {
        save(null, to.getId(), amount, userId, TransactionType.ATM_DEPOSIT);
    }

    @Transactional
    public void recordAtmWithdrawal(Account from, BigDecimal amount, Long userId) {
        save(from.getId(), null, amount, userId, TransactionType.ATM_WITHDRAWAL);
    }

    public PageResponse<TransactionDto> getHistoryForCustomer(Customer customer, TransactionFilters filters, Pageable pageable) {
        List<Long> accountIds = accountRepository.findByCustomerId(customer.getId()).stream()
                .map(Account::getId)
                .toList();

        if (accountIds.isEmpty()) {
            return PageResponse.from(Page.empty(pageable));
        }

        List<Long> ibanAccountIds = resolveIbanAccountIds(filters.iban());
        if (ibanAccountIds != null && ibanAccountIds.isEmpty()) {
            return PageResponse.from(Page.empty(pageable));
        }

        Page<Transaction> page = transactionRepository.findFiltered(
                accountIds,
                filters.startDate(),
                filters.endDate(),
                filters.minAmount(),
                filters.maxAmount(),
                filters.exactAmount(),
                ibanAccountIds,
                pageable
        );
        return PageResponse.from(page, this::toDto);
    }

    public PageResponse<TransactionDto> getGlobalLedger(Pageable pageable) {
        return PageResponse.from(transactionRepository.findAllByOrderByTimestampDesc(pageable), this::toDto);
    }

    private void save(Long fromId, Long toId, BigDecimal amount, Long userId, TransactionType type) {
        transactionRepository.save(new Transaction(fromId, toId, amount, userId, type));
    }

    private List<Long> resolveIbanAccountIds(String iban) {
        if (iban == null || iban.isBlank()) {
            return null;
        }
        return accountRepository.findByIbanStartingWithIgnoreCase(iban.trim()).stream()
                .map(Account::getId)
                .toList();
    }

    private TransactionDto toDto(Transaction transaction) {
        return new TransactionDto(
                transaction.getId(),
                lookupIban(transaction.getFromAccountId()),
                lookupIban(transaction.getToAccountId()),
                transaction.getAmount(),
                BankConstants.CURRENCY,
                transaction.getTimestamp(),
                transaction.getType()
        );
    }

    private String lookupIban(Long accountId) {
        if (accountId == null) {
            return null;
        }
        return accountRepository.findById(accountId).map(Account::getIban).orElse(null);
    }
}
