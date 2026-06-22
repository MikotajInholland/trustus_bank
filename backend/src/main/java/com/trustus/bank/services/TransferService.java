/**
 * @summary External and employee transfers with limit enforcement.
 * @author Mikotaj (Dev 3 — Auditor)
 */
package com.trustus.bank.services;

import com.trustus.bank.common.BankConstants;
import com.trustus.bank.common.exception.BusinessRuleException;
import com.trustus.bank.common.exception.ResourceNotFoundException;
import com.trustus.bank.common.enums.AccountType;
import com.trustus.bank.common.enums.TransactionType;
import com.trustus.bank.entities.Account;
import com.trustus.bank.repositories.AccountRepository;
import com.trustus.bank.entities.Customer;
import com.trustus.bank.repositories.CustomerRepository;
import com.trustus.bank.entities.Transaction;
import com.trustus.bank.repositories.TransactionRepository;
import com.trustus.bank.dto.CustomerLimitsDto;
import com.trustus.bank.dto.ExternalTransferRequest;
import com.trustus.bank.dto.TransactionDto;
import com.trustus.bank.dto.UpdateLimitsRequest;
import com.trustus.bank.common.dto.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class TransferService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;
    private final LimitService limitService;

    /**
     * @summary Wires repositories and helper services for transfer operations.
     */
    public TransferService(
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            TransactionService transactionService,
            LimitService limitService
    ) {
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.transactionService = transactionService;
        this.limitService = limitService;
    }

    /**
     * @summary Transfers EUR from a customer's checking account to another customer's account.
     */
    @Transactional
    public void customerExternalTransfer(String email, ExternalTransferRequest request) {
        Customer sender = customerRepository.requireByEmail(email);
        Account from = getCheckingAccount(sender.getId());
        Account to = resolveActiveAccountByIban(request.toIban());

        if (to.getCustomerId().equals(sender.getId())) {
            throw new BusinessRuleException("Cannot transfer to your own account");
        }

        executeTransfer(from, to, request.amount(), sender, TransactionType.EXTERNAL_TRANSFER);
    }

    /**
     * @summary Transfers EUR on behalf of a customer from their checking account.
     */
    @Transactional
    public void employeeExternalTransfer(Long fromCustomerId, ExternalTransferRequest request) {
        Customer sender = customerRepository.requireById(fromCustomerId);
        Account from = getCheckingAccount(sender.getId());
        Account to = resolveActiveAccountByIban(request.toIban());
        executeTransfer(from, to, request.amount(), sender, TransactionType.EMPLOYEE_TRANSFER);
    }

    /**
     * @summary Returns the daily and absolute transfer limits for a customer.
     */
    public CustomerLimitsDto getLimits(Long customerId) {
        return toLimitsDto(customerRepository.requireById(customerId));
    }

    /**
     * @summary Updates a customer's daily and absolute transfer limits.
     */
    @Transactional
    public CustomerLimitsDto updateLimits(Long customerId, UpdateLimitsRequest request) {
        Customer customer = customerRepository.requireById(customerId);
        customer.setDailyTransferLimit(request.dailyTransferLimit());
        customer.setAbsoluteTransferLimit(request.absoluteTransferLimit());
        return toLimitsDto(customer);
    }

    /**
     * @summary Returns paginated, filtered transactions for the logged-in customer.
     */
    public PageResponse<TransactionDto> getCustomerTransactions(
            String email,
            Instant startDate,
            Instant endDate,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            BigDecimal exactAmount,
            String iban,
            Pageable pageable
    ) {
        return getTransactionsForCustomer(
                customerRepository.requireByEmail(email),
                startDate, endDate, minAmount, maxAmount, exactAmount, iban, pageable
        );
    }

    /**
     * @summary Returns paginated, filtered transactions for a customer by ID.
     */
    public PageResponse<TransactionDto> getTransactionsForCustomerId(
            Long customerId,
            Instant startDate,
            Instant endDate,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            BigDecimal exactAmount,
            String iban,
            Pageable pageable
    ) {
        return getTransactionsForCustomer(
                customerRepository.requireById(customerId),
                startDate, endDate, minAmount, maxAmount, exactAmount, iban, pageable
        );
    }

    /**
     * @summary Returns every transaction in the system, newest first.
     */
    public PageResponse<TransactionDto> getGlobalLedger(Pageable pageable) {
        return PageResponse.from(transactionRepository.findAllByOrderByTimestampDesc(pageable), this::toDto);
    }

    /**
     * @summary Queries and maps transactions involving any of the customer's accounts.
     */
    private PageResponse<TransactionDto> getTransactionsForCustomer(
            Customer customer,
            Instant startDate,
            Instant endDate,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            BigDecimal exactAmount,
            String iban,
            Pageable pageable
    ) {
        List<Long> accountIds = accountRepository.findByCustomerId(customer.getId()).stream()
                .map(Account::getId)
                .toList();

        if (accountIds.isEmpty()) {
            return PageResponse.from(Page.empty(pageable));
        }

        Long ibanAccountId = null;
        if (iban != null && !iban.isBlank()) {
            ibanAccountId = accountRepository.findByIban(iban)
                    .map(Account::getId)
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found for IBAN"));
        }

        Page<Transaction> page = transactionRepository.findFiltered(
                accountIds, startDate, endDate, minAmount, maxAmount, exactAmount, ibanAccountId, pageable
        );
        return PageResponse.from(page, this::toDto);
    }

    /**
     * @summary Looks up an active account by destination IBAN.
     */
    private Account resolveActiveAccountByIban(String iban) {
        return accountRepository.findByIban(iban)
                .filter(Account::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Destination account not found"));
    }

    /**
     * @summary Validates balance and limits, moves funds, and records the ledger entry.
     */
    private void executeTransfer(Account from, Account to, BigDecimal amount, Customer sender, TransactionType type) {
        if (from.getId().equals(to.getId())) {
            throw new BusinessRuleException("Cannot transfer to the same account");
        }
        if (from.getBalance().compareTo(amount) < 0) {
            throw new BusinessRuleException("Insufficient balance");
        }

        limitService.validateTransferLimits(sender, amount);

        from.setBalance(from.getBalance().subtract(amount));
        to.setBalance(to.getBalance().add(amount));
        transactionService.recordExternalTransfer(from, to, amount, sender.getUserId(), type);
    }

    /**
     * @summary Returns the customer's active checking account.
     */
    private Account getCheckingAccount(Long customerId) {
        return accountRepository.findByCustomerIdAndType(customerId, AccountType.CHECKING)
                .filter(Account::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Checking account not found"));
    }

    /**
     * @summary Maps a customer entity to a limits response DTO.
     */
    private CustomerLimitsDto toLimitsDto(Customer customer) {
        return new CustomerLimitsDto(
                customer.getId(),
                customer.getFullName(),
                customer.getDailyTransferLimit(),
                customer.getAbsoluteTransferLimit(),
                BankConstants.CURRENCY
        );
    }

    /**
     * @summary Maps a transaction entity to an API response DTO with IBANs.
     */
    private TransactionDto toDto(Transaction transaction) {
        return new TransactionDto(
                transaction.getId(),
                resolveIban(transaction.getFromAccountId()),
                resolveIban(transaction.getToAccountId()),
                transaction.getAmount(),
                BankConstants.CURRENCY,
                transaction.getTimestamp(),
                transaction.getType()
        );
    }

    /**
     * @summary Resolves an account ID to its IBAN, or null when absent.
     */
    private String resolveIban(Long accountId) {
        if (accountId == null) {
            return null;
        }
        return accountRepository.findById(accountId).map(Account::getIban).orElse(null);
    }
}
