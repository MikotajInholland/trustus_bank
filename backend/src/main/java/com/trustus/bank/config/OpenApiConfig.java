// Swagger/OpenAPI metadata and JWT security scheme.
// @author Mikotaj (Dev 3 — Auditor)
package com.trustus.bank.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    // Builds the OpenAPI document with JWT bearer auth scheme.
    @Bean
    public OpenAPI trustusOpenApi() {
        final String schemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("TrustUs Bank API")
                        .description("""
                                REST API for TrustUs Bank — all amounts in EUR.

                                ## Demo accounts
                                | Role | Email | Password |
                                |------|-------|----------|
                                | Customer | `wesley@trustus.bank` | `customer123` |
                                | Customer | `darlington@trustus.bank` | `customer123` |
                                | Customer | `mikotaj@trustus.bank` | `customer123` |
                                | Employee | `employee@trustus.bank` | `employee123` |

                                ## Authenticating in Swagger
                                1. `POST /api/auth/login` with a demo account.
                                2. Copy the `token` from the response.
                                3. Click **Authorize**, enter `Bearer <token>`, then **Authorize** again.

                                ## Error responses
                                Most errors return JSON with `timestamp`, `status`, and `message`.
                                Validation errors also include an `errors` object with field messages.
                                Pending-approval customers receive HTTP 403 with `{ "message": "Your account is pending employee approval" }`.

                                Use the **Error sandbox** tag to trigger sample 400/404 responses,
                                or `GET /api/docs/errors/protected` to experiment with 401/403.
                                """)
                        .version("0.0.1")
                        .contact(new Contact().name("TrustUs Bank Team")))
                .addSecurityItem(new SecurityRequirement().addList(schemeName))
                .components(new Components()
                        .addSecuritySchemes(schemeName, new SecurityScheme()
                                .name(schemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
