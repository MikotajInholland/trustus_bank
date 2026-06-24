// Exception for missing resources (HTTP 404).
// @author Mikotaj (Dev 3 — Auditor)
package com.trustus.bank.common.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends RuntimeException {

    private final HttpStatus status;

    // Creates a not-found exception with HTTP 404.
    public ResourceNotFoundException(String message) {
        this(message, HttpStatus.NOT_FOUND);
    }

    // Creates a not-found exception with a custom HTTP status.
    public ResourceNotFoundException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    // Returns the HTTP status to send in the error response.
    public HttpStatus getStatus() {
        return status;
    }
}
