package org.example.sellsight.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

/**
 * Global OpenAPI 3.1 configuration for SellSight.
 *
 * <p>After the application starts, the interactive Swagger UI is available at:
 *   <a href="http://localhost:8080/swagger-ui.html">http://localhost:8080/swagger-ui.html</a>
 *
 * <p>The raw OpenAPI JSON spec (used by Portman to generate the Postman collection) is at:
 *   <a href="http://localhost:8080/v3/api-docs">http://localhost:8080/v3/api-docs</a>
 */
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title       = "SellSight API",
        version     = "1.0.0",
        description = "Production-grade e-commerce REST API with JWT authentication, "
                    + "role-based access control (ADMIN / SELLER / CUSTOMER), "
                    + "and DDD + Hexagonal Architecture.",
        contact     = @Contact(name = "SellSight Team", email = "api@sellsight.com")
    ),
    servers = {
        @Server(url = "http://localhost:8080", description = "Local development"),
        @Server(url = "http://api.sellsight.com", description = "Production")
    }
)
@SecurityScheme(
    name        = "bearerAuth",
    type        = SecuritySchemeType.HTTP,
    scheme      = "bearer",
    bearerFormat = "JWT",
    description = "Obtain a token via POST /api/auth/login or POST /api/auth/register, "
                + "then prefix it with 'Bearer ' in the Authorization header."
)
public class OpenApiConfig {
    // Intentionally empty — all configuration is supplied via annotations above.
}
