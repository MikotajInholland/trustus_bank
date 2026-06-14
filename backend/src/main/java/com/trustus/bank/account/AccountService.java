/** @summary Dashboard, directory search, internal transfers, and ATM operations. */
package com.trustus.bank.account;

import com.trustus.bank.account.dto.AccountDto;
import com.trustus.bank.account.dto.AtmTransactionRequest;
import com.trustus.bank.account.dto.CustomerDashboardDto;
import com.trustus.bank.account.dto.CustomerDirectoryEntryDto;
import com.trustus.bank.account.dto.InternalTransferRequest;
import com.trustus.bank.auth.dto.CustomerSummaryDto;
import com.trustus.bank.common.dto.PageResponse;
import com.trustus.bank.common.enums.AccountType;
import com.trustus.bank.common.exception.BusinessRuleException;
import com.trustus.bank.common.exception.ResourceNotFoundException;
import com.trustus.bank.domain.account.Account;
import com.trustus.bank.domain.account.AccountRepository;
import com.trustus.bank.domain.customer.Customer;
import com.trustus.bank.domain.customer.CustomerRepository;
import com.trustus.bank.domain.user.User;
import com.trustus.bank.domain.user.UserRepository;
import com.trustus.bank.transfer.LimitService;
import com.trustus.bank.transfer.TransactionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * @author Darlington (Dev 2 — Teller)
 */
@Service
public class AccountService {

    private static final String CURRENCY = "EUR";

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final TransactionService transactionService;
    private final LimitService limitService;

    public AccountService(
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            UserRepository userRepository,
            TransactionService transactionService,
            LimitService limitService
    ) {
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.transactionService = transactionService;
        this.limitService = limitService;
    }

    public CustomerDashboardDto getDashboardForEmail(String email) {
        Customer customer = findCustomerByEmail(email);
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
                CURRENCY
        );
    }

    public PageResponse<CustomerSummaryDto> listActiveCustomers(Pageable pageable, String search) {
        String normalizedSearch = search == null || search.isBlank() ? null : search.trim();
        Page<Customer> page = customerRepository.findApprovedBySearch(normalizedSearch, pageable);
        List<CustomerSummaryDto> content = page.getContent().stream()
                .map(this::toSummary)
                .toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
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
        Customer customer = findCustomerByEmail(email);
        Account from = getAccount(customer.getId(), request.fromAccountType());
        Account to = getAccount(customer.getId(), request.toAccountType());

        if (from.getBalance().compareTo(request.amount()) < 0) {
            throw new BusinessRuleException("Insufficient balance");
        }

        from.setBalance(from.getBalance().subtract(request.amount()));
        to.setBalance(to.getBalance().add(request.amount()));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        transactionService.recordInternalTransfer(from, to, request.amount(), user.getId());
    }

    @Transactional
    public void atmDeposit(String email, AtmTransactionRequest request) {
        Customer customer = findCustomerByEmail(email);
        Account checking = getAccount(customer.getId(), AccountType.CHECKING);
        checking.setBalance(checking.getBalance().add(request.amount()));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        transactionService.recordAtmDeposit(checking, request.amount(), user.getId());
    }

    @Transactional
    public void atmWithdraw(String email, AtmTransactionRequest request) {
        Customer customer = findCustomerByEmail(email);
        Account checking = getAccount(customer.getId(), AccountType.CHECKING);

        if (checking.getBalance().compareTo(request.amount()) < 0) {
            throw new BusinessRuleException("Insufficient balance");
        }

        limitService.validateTransferLimits(customer, request.amount());
        checking.setBalance(checking.getBalance().subtract(request.amount()));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        transactionService.recordAtmWithdrawal(checking, request.amount(), user.getId());
    }

    private Customer findCustomerByEmail(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
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
                CURRENCY,
                account.isActive()
        );
    }

    private CustomerSummaryDto toSummary(Customer customer) {
        return new CustomerSummaryDto(
                customer.getId(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getEmail(),
                customer.getPhoneNumber(),
                customer.isApproved()
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
