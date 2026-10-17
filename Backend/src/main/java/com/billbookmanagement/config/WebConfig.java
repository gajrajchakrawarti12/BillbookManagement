package com.billbookmanagement.config;
import org.springframework.beans.factory.annotation.Value; import org.springframework.context.annotation.Configuration; import org.springframework.web.servlet.config.annotation.*;
@Configuration
public class WebConfig implements WebMvcConfigurer {
 @Value("${app.client-url}") private String clientUrl;
 @Override public void addCorsMappings(CorsRegistry registry){registry.addMapping("/**").allowedOrigins(clientUrl).allowedMethods("GET","POST","PUT","PATCH","DELETE","OPTIONS").allowCredentials(true).maxAge(86400);}
}
