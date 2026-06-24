// Standard JSON error body returned by the global exception handler.
// @author Mikotaj (Dev 3 — Auditor)
package com.trustus.bank.common.openapi;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.Map;

@Schema(description = "Standard API error response")
public class ApiErrorResponse {

    @Schema(example = "2026-06-24T12:00:00Z", description = "ISO-8601 timestamp")
    private String timestamp;

    @Schema(example = "400", description = "HTTP status code")
    private int status;

    @Schema(example = "Validation failed", description = "Human-readable error summary")
    private String message;

    @Schema(description = "Field-level validation errors (400 validation only)")
    private Map<String, String> errors;

    public String getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}
