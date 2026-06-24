// Swagger sandbox for trying out API error responses.
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
@Tag(name = "Error sandbox", description = "Try these endpoints in Swagger to see each error shape")
public class ApiErrorDocController {

    @GetMapping("/not-found")
    @SecurityRequirements
    @Operation(summary = "Trigger 404 Not Found")
    public void triggerNotFound() {
        throw new ResourceNotFoundException("Customer not found");
    }

    @GetMapping("/business-rule")
    @SecurityRequirements
    @Operation(summary = "Trigger 400 Business rule")
    public void triggerBusinessRule() {
        throw new BusinessRuleException("Insufficient balance");
    }

    @PostMapping("/validation")
    @SecurityRequirements
    @PublicWriteApiResponses
    @Operation(summary = "Trigger 400 Validation failed")
    public void triggerValidation(@Valid @RequestBody LoginRequest request) {
        // Reached only when the body passes validation.
    }

    @GetMapping("/protected")
    @ProtectedApiResponses
    @Operation(summary = "Test 401/403 auth errors")
    public ResponseEntity<Map<String, String>> triggerAuthErrors() {
        return ResponseEntity.ok(Map.of("message", "Authenticated successfully"));
    }
}
