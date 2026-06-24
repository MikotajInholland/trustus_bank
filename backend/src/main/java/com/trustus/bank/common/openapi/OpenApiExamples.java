// Example JSON payloads for OpenAPI error documentation.
// @author Mikotaj (Dev 3 — Auditor)
package com.trustus.bank.common.openapi;

public final class OpenApiExamples {

    public static final String VALIDATION_ERROR = """
            {
              "timestamp": "2026-06-24T12:00:00Z",
              "status": 400,
              "message": "Validation failed",
              "errors": {
                "email": "must not be blank",
                "password": "must not be blank"
              }
            }
            """;

    public static final String BUSINESS_RULE_ERROR = """
            {
              "timestamp": "2026-06-24T12:00:00Z",
              "status": 400,
              "message": "Insufficient balance"
            }
            """;

    public static final String NOT_FOUND_ERROR = """
            {
              "timestamp": "2026-06-24T12:00:00Z",
              "status": 404,
              "message": "Customer not found"
            }
            """;

    public static final String INTERNAL_ERROR = """
            {
              "timestamp": "2026-06-24T12:00:00Z",
              "status": 500,
              "message": "An unexpected error occurred"
            }
            """;

    public static final String PENDING_APPROVAL_ERROR = """
            {
              "message": "Your account is pending employee approval"
            }
            """;

    private OpenApiExamples() {
    }
}
