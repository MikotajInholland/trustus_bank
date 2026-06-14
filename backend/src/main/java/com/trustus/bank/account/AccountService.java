/**
 * @summary Dashboard, directory search, internal transfers, and ATM operations.
 * @author Darlington (Dev 2 — Teller)
 */
package com.trustus.bank.account;

import com.trustus.bank.account.dto.AccountDto;
import com.trustus.bank.account.dto.AtmTransactionRequest;
import com.trustus.bank.account.dto.CustomerDashboardDto;
import com.trustus.bank.account.dto.CustomerDirectoryEntryDto;
import com.trustus.bank.account.dto.InternalTransferRequest;
import com.trustus.bank.auth.dto.CustomerSummaryDto;
import com.trustus.bank.common.BankConstants;
import com.trustus.bank.common.dto.PageResponse;
import com.trustus.bank.common.enums.AccountType;
import com.trustus.bank.common.exception.BusinessRuleException;
import com.trustus.bank.common.exception.ResourceNotFoundException;
import com.trustus.bank.domain.account.Account;
import com.trustus.bank.domain.account.AccountRepository;
import com.trustus.bank.domain.customer.Customer;
import com.trustus.bank.domain.customer.CustomerRepository;
import com.trustus.bank.transfer.LimitService;
import com.trustus.bank.transfer.TransactionService;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AccountService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final TransactionService transactionService;
    private final LimitService limitService;

    public AccountService(
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

    public CustomerDashboardDto getDashboardForEmail(String email) {
        Customer customer = customerRepository.requireByEmail(email);
        List<AccountDto> accounts = accountRepository.findByCustomerIdAndActiveTrue(customer.getId())
                .stream()
                .map(this::toAccountDto)
                .toList();

        BigDecimal combined = accounts.stream()
                .map(AccountDto::balance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CustomerDashboardDto(
                customer.getId(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getEmail(),
                customer.getPhoneNumber(),
                accounts,
                combined,
                BankConstants.CURRENCY
        );
    }

    public PageResponse<CustomerSummaryDto> listActiveCustomers(Pageable pageable, String search) {
        String normalizedSearch = search == null || search.isBlank() ? null : search.trim();
        return PageResponse.from(
                customerRepository.findByApprovedAndSearch(true, normalizedSearch, pageable),
                CustomerSummaryDto::from
        );
    }

    public List<CustomerDirectoryEntryDto> searchDirectory(String query, String callerEmail) {
        var excludeCustomerId = customerRepository.findByEmail(callerEmail).map(Customer::getId);
        return customerRepository.searchByName(query).stream()
                .filter(customer -> excludeCustomerId.isEmpty() || !customer.getId().equals(excludeCustomerId.get()))
                .map(this::toDirectoryEntry)
                .toList();
    }

    @Transactional
    public void internalTransfer(String email, InternalTransferRequest request) {
        Customer customer = customerRepository.requireByEmail(email);
        Account from = getAccount(customer.getId(), request.fromAccountType());
        Account to = getAccount(customer.getId(), request.toAccountType());

        if (from.getBalance().compareTo(request.amount()) < 0) {
            throw new BusinessRuleException("Insufficient balance");
        }

        from.setBalance(from.getBalance().subtract(request.amount()));
        to.setBalance(to.getBalance().add(request.amount()));
        transactionService.recordInternalTransfer(from, to, request.amount(), customer.getUserId());
    }

    @Transactional
    public void atmDeposit(String email, AtmTransactionRequest request) {
        Customer customer = customerRepository.requireByEmail(email);
        Account checking = getAccount(customer.getId(), AccountType.CHECKING);
        checking.setBalance(checking.getBalance().add(request.amount()));
        transactionService.recordAtmDeposit(checking, request.amount(), customer.getUserId());
    }

    @Transactional
    public void atmWithdraw(String email, AtmTransactionRequest request) {
        Customer customer = customerRepository.requireByEmail(email);
        Account checking = getAccount(customer.getId(), AccountType.CHECKING);

        if (checking.getBalance().compareTo(request.amount()) < 0) {
            throw new BusinessRuleException("Insufficient balance");
        }

        limitService.validateTransferLimits(customer, request.amount());
        checking.setBalance(checking.getBalance().subtract(request.amount()));
        transactionService.recordAtmWithdrawal(checking, request.amount(), customer.getUserId());
    }

    private Account getAccount(Long customerId, AccountType type) {
        return accountRepository.findByCustomerIdAndType(customerId, type)
                .filter(Account::isActive)
                .orElseThrow(() -> new ResourceNotFoundException(type + " account not found"));
    }

    private AccountDto toAccountDto(Account account) {
        return new AccountDto(
                account.getId(),
                account.getType(),
                account.getIban(),
                account.getBalance(),
                BankConstants.CURRENCY,
                account.isActive()
        );
    }

    private CustomerDirectoryEntryDto toDirectoryEntry(Customer customer) {
        String checkingIban = accountRepository.findByCustomerIdAndType(customer.getId(), AccountType.CHECKING)
                .map(Account::getIban)
                .orElse(null);

        return new CustomerDirectoryEntryDto(
                customer.getId(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getEmail(),
                checkingIban
        );
    }
}
