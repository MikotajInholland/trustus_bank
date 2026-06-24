// Swagger sandbox for triggering sample API error responses.
// @author Mikotaj (Dev 3 — Auditor)
package com.trustus.bank.controllers;

import com.trustus.bank.common.exception.BusinessRuleException;
import com.trustus.bank.common.exception.ResourceNotFoundException;
import com.trustus.bank.common.openapi.OpenApiExamples;
import com.trustus.bank.common.openapi.ProtectedApiResponses;
import com.trustus.bank.common.openapi.PublicWriteApiResponses;
import com.trustus.bank.dto.LoginRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/docs/errors")
@Profile("!test")
@Tag(
        name = "Error sandbox",
        description = """
                Try these endpoints in Swagger UI to see each error shape.
                Public triggers return errors without authentication.
                Use **protected** to test 401/403 by clearing Authorize or using the wrong role token.
                """
)
public class ApiErrorDocController {

    @GetMapping("/not-found")
    @SecurityRequirements
    @Operation(
            summary = "Trigger 404 Not Found",
            description = "No auth required. Returns a sample `Customer not found` response.",
            responses = @ApiResponse(
                    responseCode = "404",
                    description = "Resource not found",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = OpenApiExamples.NOT_FOUND_ERROR)
                    )
            )
    )
    public void triggerNotFound() {
        throw new ResourceNotFoundException("Customer not found");
    }

    @GetMapping("/business-rule")
    @SecurityRequirements
    @Operation(
            summary = "Trigger 400 Business rule",
            description = "No auth required. Returns a sample `Insufficient balance` response.",
            responses = @ApiResponse(
                    responseCode = "400",
                    description = "Business rule rejected",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = OpenApiExamples.BUSINESS_RULE_ERROR)
                    )
            )
    )
    public void triggerBusinessRule() {
        throw new BusinessRuleException("Insufficient balance");
    }

    @PostMapping("/validation")
    @SecurityRequirements
    @PublicWriteApiResponses
    @Operation(
            summary = "Trigger 400 Validation failed",
            description = """
                    No auth required. Send an empty body `{}` or omit required fields to get field errors.
                    """
    )
    public void triggerValidation(@Valid @RequestBody LoginRequest request) {
        // Only reached when the request body passes validation.
    }

    @GetMapping("/protected")
    @ProtectedApiResponses
    @Operation(
            summary = "Test 401/403 auth errors",
            description = """
                    Requires a valid JWT.
                    - Clear **Authorize** and Execute → 401/403 (unauthenticated).
                    - Use a customer token and call `GET /api/employee/customers` → 403 (wrong role).
                    - Register a new customer (unapproved) and call `GET /api/customer/dashboard` → 403 pending approval.
                    """
    )
    public ResponseEntity<Map<String, String>> triggerAuthErrors() {
        return ResponseEntity.ok(Map.of("message", "Authenticated successfully"));
    }
}
