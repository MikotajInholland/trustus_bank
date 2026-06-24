// Reusable OpenAPI error responses for public write endpoints (login, register).
// @author Mikotaj (Dev 3 — Auditor)
package com.trustus.bank.common.openapi;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@ApiResponses({
        @ApiResponse(
                responseCode = "400",
                description = "Validation failed or business rule rejected",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = ApiErrorResponse.class),
                        examples = {
                                @ExampleObject(name = "Validation", value = OpenApiExamples.VALIDATION_ERROR),
                                @ExampleObject(name = "Business rule", value = OpenApiExamples.BUSINESS_RULE_ERROR)
                        }
                )
        ),
        @ApiResponse(
                responseCode = "500",
                description = "Unexpected server error",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = ApiErrorResponse.class),
                        examples = @ExampleObject(name = "Internal error", value = OpenApiExamples.INTERNAL_ERROR)
                )
        )
})
public @interface PublicWriteApiResponses {
}
