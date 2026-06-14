/**
 * @summary Exception for missing resources (HTTP 404). 
 * @author Mikotaj (Dev 3 — Auditor)
 */
package com.trustus.bank.common.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends RuntimeException {

    private final HttpStatus status;

    public ResourceNotFoundException(String message) {
        this(message, HttpStatus.NOT_FOUND);
    }

    public ResourceNotFoundException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
