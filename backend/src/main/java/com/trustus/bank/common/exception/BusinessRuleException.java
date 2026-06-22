/**
 * @summary Exception for rejected business operations (HTTP 422).
 * @author Mikotaj (Dev 3 — Auditor)
 */
package com.trustus.bank.common.exception;

import org.springframework.http.HttpStatus;

public class BusinessRuleException extends RuntimeException {

    private final HttpStatus status;

    /**


     * @summary Creates a business rule exception with HTTP 400 Bad Request.


     */
    public BusinessRuleException(String message) {
        this(message, HttpStatus.BAD_REQUEST);
    }

    /**


     * @summary Creates a business rule exception with a custom HTTP status.


     */
    public BusinessRuleException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    /**


     * @summary Returns the HTTP status to send in the error response.


     */
    public HttpStatus getStatus() {
        return status;
    }
}
