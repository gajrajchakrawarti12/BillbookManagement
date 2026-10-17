package com.billbookmanagement.security;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.OctetSequenceKey;
import javax.crypto.spec.SecretKeySpec;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    SecretKey jwtSecret(@Value("${app.jwt.secret}") String secret) {
        byte[] key = secret.getBytes(StandardCharsets.UTF_8);
        if (key.length < 32) throw new IllegalStateException("JWT_SECRET must be at least 32 bytes");
        return new SecretKeySpec(key, "HmacSHA256");
    }

    @Bean
    JwtDecoder jwtDecoder(SecretKey key) {
        return NimbusJwtDecoder.withSecretKey(key)
            .macAlgorithm(MacAlgorithm.HS256)
            .build();
    }
    @Bean
    JwtEncoder jwtEncoder(SecretKey key) {
        OctetSequenceKey signingKey = new OctetSequenceKey.Builder(key)
            .algorithm(JWSAlgorithm.HS256)
            .keyID("billbook-jwt-hs256")
            .build();
        return new NimbusJwtEncoder((selector, context) -> List.of(signingKey));
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        DefaultBearerTokenResolver headerTokenResolver = new DefaultBearerTokenResolver();
        BearerTokenResolver cookieTokenResolver = request -> {
            if (request.getCookies() != null) {
                String cookieToken = Arrays.stream(request.getCookies())
                    .filter(cookie -> "access_token".equals(cookie.getName()))
                    .map(jakarta.servlet.http.Cookie::getValue)
                    .findFirst()
                    .orElse(null);
                if (cookieToken != null && !cookieToken.isBlank()) return cookieToken;
            }
            return headerTokenResolver.resolve(request);
        };
        http.csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/auth/refresh",
                    "/api/auth/logout",
                    "/health",
                    "/actuator/health",
                    "/v3/api-docs/**",
                    "/swagger-ui/**"
                ).permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().authenticated())
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, exception) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Authentication required\"}");
                })
                .accessDeniedHandler((request, response, exception) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Access denied\"}");
                }))
            .oauth2ResourceServer(oauth -> oauth
                .bearerTokenResolver(cookieTokenResolver)
                .jwt(jwt -> {}));
        return http.build();
    }

}
