/** @summary External and employee transfers with limit enforcement. */
package com.trustus.bank.transfer;

import com.trustus.bank.common.exception.BusinessRuleException;
import com.trustus.bank.common.exception.ResourceNotFoundException;
import com.trustus.bank.common.enums.AccountType;
import com.trustus.bank.common.enums.TransactionType;
import com.trustus.bank.domain.account.Account;
import com.trustus.bank.domain.account.AccountRepository;
import com.trustus.bank.domain.customer.Customer;
import com.trustus.bank.domain.customer.CustomerRepository;
import com.trustus.bank.domain.transaction.Transaction;
import com.trustus.bank.domain.user.User;
import com.trustus.bank.domain.user.UserRepository;
import com.trustus.bank.transfer.dto.CustomerLimitsDto;
import com.trustus.bank.transfer.dto.ExternalTransferRequest;
import com.trustus.bank.transfer.dto.TransactionDto;
import com.trustus.bank.transfer.dto.UpdateLimitsRequest;
import com.trustus.bank.common.dto.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * @author Mikotaj (Dev 3 — Auditor)
 */
@Service
public class TransferService {

    private static final String CURRENCY = "EUR";

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final TransactionRepositoryFacade transactionRepositoryFacade;
    private final TransactionService transactionService;
    private final LimitService limitService;

    public TransferService(
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            UserRepository userRepository,
            TransactionRepositoryFacade transactionRepositoryFacade,
            TransactionService transactionService,
            LimitService limitService
    ) {
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.transactionRepositoryFacade = transactionRepositoryFacade;
        this.transactionService = transactionService;
        this.limitService = limitService;
    }

    @Transactional
    public void customerExternalTransfer(String email, ExternalTransferRequest request) {
        Customer sender = findCustomerByEmail(email);
        Account from = getCheckingAccount(sender.getId());
        Account to = accountRepository.findByIban(request.toIban())
                .filter(Account::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Destination account not found"));

        if (to.getCustomerId().equals(sender.getId())) {
            throw new BusinessRuleException("Cannot transfer to your own account");
        }

        executeTransfer(from, to, request.amount(), sender, TransactionType.EXTERNAL_TRANSFER);
    }

    @Transactional
    public void employeeExternalTransfer(Long fromCustomerId, ExternalTransferRequest request) {
        Customer sender = customerRepository.findById(fromCustomerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        Account from = getCheckingAccount(sender.getId());
        Account to = accountRepository.findByIban(request.toIban())
                .filter(Account::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Destination account not found"));

        executeTransfer(from, to, request.amount(), sender, TransactionType.EMPLOYEE_TRANSFER);
    }

    public CustomerLimitsDto getLimits(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        return new CustomerLimitsDto(
                customer.getId(),
                customer.getFullName(),
                customer.getDailyTransferLimit(),
                customer.getAbsoluteTransferLimit(),
                CURRENCY
        );
    }

    @Transactional
    public CustomerLimitsDto updateLimits(Long customerId, UpdateLimitsRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        customer.setDailyTransferLimit(request.dailyTransferLimit());
        customer.setAbsoluteTransferLimit(request.absoluteTransferLimit());

        return getLimits(customerId);
    }

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
        Customer customer = findCustomerByEmail(email);
        return getTransactionsForCustomer(customer, startDate, endDate, minAmount, maxAmount, exactAmount, iban, pageable);
    }

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
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return getTransactionsForCustomer(customer, startDate, endDate, minAmount, maxAmount, exactAmount, iban, pageable);
    }

    public PageResponse<TransactionDto> getGlobalLedger(Pageable pageable) {
        Page<Transaction> page = transactionRepositoryFacade.findAll(pageable);
        return toPageResponse(page);
    }

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

        Long ibanAccountId = null;
        if (iban != null && !iban.isBlank()) {
            ibanAccountId = accountRepository.findByIban(iban)
                    .map(Account::getId)
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found for IBAN"));
        }

        Page<Transaction> page = transactionRepositoryFacade.findFiltered(
                accountIds,
                startDate,
                endDate,
                minAmount,
                maxAmount,
                exactAmount,
                ibanAccountId,
                pageable
        );

        return toPageResponse(page);
    }

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

        User user = userRepository.findById(sender.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        transactionService.recordExternalTransfer(from, to, amount, user.getId(), type);
    }

    private Customer findCustomerByEmail(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    private Account getCheckingAccount(Long customerId) {
        return accountRepository.findByCustomerIdAndType(customerId, AccountType.CHECKING)
                .filter(Account::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Checking account not found"));
    }

    private PageResponse<TransactionDto> toPageResponse(Page<Transaction> page) {
        List<TransactionDto> content = page.getContent().stream()
                .map(this::toDto)
                .toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    private TransactionDto toDto(Transaction transaction) {
        String fromIban = resolveIban(transaction.getFromAccountId());
        String toIban = resolveIban(transaction.getToAccountId());

        return new TransactionDto(
                transaction.getId(),
                fromIban,
                toIban,
                transaction.getAmount(),
                CURRENCY,
                transaction.getTimestamp(),
                transaction.getType()
        );
    }

    private String resolveIban(Long accountId) {
        if (accountId == null) {
            return null;
        }
        return accountRepository.findById(accountId).map(Account::getIban).orElse(null);
    }
}
