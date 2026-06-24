// JPA entity for a money movement ledger entry.
// @author Mikotaj (Dev 3 — Auditor)
package com.trustus.bank.entities;

import com.trustus.bank.common.enums.TransactionType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private Long fromAccountId;

    @Column
    private Long toAccountId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private Instant timestamp = Instant.now();

    @Column(nullable = false)
    private Long initiatingUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

 
    protected Transaction() {
    }

 
    public Transaction(
            Long fromAccountId,
            Long toAccountId,
            BigDecimal amount,
            Long initiatingUserId,
            TransactionType type
    ) {
        this.fromAccountId = fromAccountId;
        this.toAccountId = toAccountId;
        this.amount = amount;
        this.initiatingUserId = initiatingUserId;
        this.type = type;
    }

   
    public Long getId() {
        return id;
    }

 
    public Long getFromAccountId() {
        return fromAccountId;
    }

 
    public Long getToAccountId() {
        return toAccountId;
    }

  
    public BigDecimal getAmount() {
        return amount;
    }

  
    public Instant getTimestamp() {
        return timestamp;
    }

   
    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

  
    public Long getInitiatingUserId() {
        return initiatingUserId;
    }

    public TransactionType getType() {
        return type;
    }
}
