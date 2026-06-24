// External transfers and customer limit management.
// @author Mikotaj (Dev 3 — Auditor)
package com.trustus.bank.services;

import com.trustus.bank.common.BankConstants;
import com.trustus.bank.common.dto.PageResponse;
import com.trustus.bank.common.enums.AccountType;
import com.trustus.bank.common.enums.TransactionType;
import com.trustus.bank.common.exception.BusinessRuleException;
import com.trustus.bank.common.exception.ResourceNotFoundException;
import com.trustus.bank.dto.CustomerLimitsDto;
import com.trustus.bank.dto.ExternalTransferRequest;
import com.trustus.bank.dto.TransactionDto;
import com.trustus.bank.dto.TransactionFilters;
import com.trustus.bank.dto.UpdateLimitsRequest;
import com.trustus.bank.entities.Account;
import com.trustus.bank.entities.Customer;
import com.trustus.bank.repositories.AccountRepository;
import com.trustus.bank.repositories.CustomerRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class TransferService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final TransactionService transactionService;
    private final LimitService limitService;

    public TransferService(
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            TransactionService transactionService,
            LimitService limitService
    ) {
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.transactionService = transactionService;
        this.limitService = limitService;
    }

    @Transactional
    public void customerExternalTransfer(String email, ExternalTransferRequest request) {
        Customer sender = customerRepository.requireByEmail(email);
        Account from = getCheckingAccount(sender.getId());
        Account to = findActiveAccountByIban(request.toIban());

        if (to.getCustomerId().equals(sender.getId())) {
            throw new BusinessRuleException("Cannot transfer to your own account");
        }

        executeTransfer(from, to, request.amount(), sender, TransactionType.EXTERNAL_TRANSFER);
    }

    @Transactional
    public void employeeExternalTransfer(Long customerId, ExternalTransferRequest request) {
        Customer sender = customerRepository.requireById(customerId);
        Account from = getCheckingAccount(sender.getId());
        Account to = findActiveAccountByIban(request.toIban());
        executeTransfer(from, to, request.amount(), sender, TransactionType.EMPLOYEE_TRANSFER);
    }

    public CustomerLimitsDto getLimits(Long customerId) {
        return toLimitsDto(customerRepository.requireById(customerId));
    }

    @Transactional
    public CustomerLimitsDto updateLimits(Long customerId, UpdateLimitsRequest request) {
        Customer customer = customerRepository.requireById(customerId);
        customer.setDailyTransferLimit(request.dailyTransferLimit());
        customer.setAbsoluteTransferLimit(request.absoluteTransferLimit());
        return toLimitsDto(customer);
    }

    public PageResponse<TransactionDto> getCustomerTransactions(String email, TransactionFilters filters, Pageable pageable) {
        Customer customer = customerRepository.requireByEmail(email);
        return transactionService.getHistoryForCustomer(customer, filters, pageable);
    }

    public PageResponse<TransactionDto> getTransactionsForCustomerId(Long customerId, TransactionFilters filters, Pageable pageable) {
        Customer customer = customerRepository.requireById(customerId);
        return transactionService.getHistoryForCustomer(customer, filters, pageable);
    }

    public PageResponse<TransactionDto> getGlobalLedger(Pageable pageable) {
        return transactionService.getGlobalLedger(pageable);
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
        transactionService.recordExternalTransfer(from, to, amount, sender.getUserId(), type);
    }

    private Account getCheckingAccount(Long customerId) {
        return accountRepository.findByCustomerIdAndType(customerId, AccountType.CHECKING)
                .filter(Account::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Checking account not found"));
    }

    private Account findActiveAccountByIban(String iban) {
        return accountRepository.findByIban(iban)
                .filter(Account::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Destination account not found"));
    }

    private CustomerLimitsDto toLimitsDto(Customer customer) {
        return new CustomerLimitsDto(
                customer.getId(),
                customer.getFullName(),
                customer.getDailyTransferLimit(),
                customer.getAbsoluteTransferLimit(),
                BankConstants.CURRENCY
        );
    }
}
