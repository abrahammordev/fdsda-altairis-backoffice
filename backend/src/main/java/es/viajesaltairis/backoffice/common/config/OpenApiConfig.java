package es.viajesaltairis.backoffice.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI altairisOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Backoffice Viajes Altairis · API")
                .description("Hoteles, tipos de habitación, inventario y reservas")
                .version("v1"));
    }
}
