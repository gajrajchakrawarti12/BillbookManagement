package com.billbookmanagement.modules.auth.service;

import com.billbookmanagement.modules.auth.entity.AppUser;
import com.billbookmanagement.modules.auth.repository.AppUserRepository;
import com.billbookmanagement.shared.service.ApiException;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import java.time.*;
import java.util.*;

@Service
public class AuthService {
    private final AppUserRepository users;
    private final PasswordEncoder passwords;
    private final JwtEncoder encoder;
    private final JwtDecoder decoder;
    private final Duration accessExpiry;
    private final Duration refreshExpiry;
    private final boolean secure;

    public AuthService(AppUserRepository users, PasswordEncoder passwords, JwtEncoder encoder, JwtDecoder decoder,
            @Value("${app.jwt.access-expiry}") Duration accessExpiry,
            @Value("${app.jwt.refresh-expiry}") Duration refreshExpiry,
            @Value("${app.cookie-secure}") boolean secure) {
        this.users = users;
        this.passwords = passwords;
        this.encoder = encoder;
        this.decoder = decoder;
        this.accessExpiry = accessExpiry;
        this.refreshExpiry = refreshExpiry;
        this.secure = secure;
    }

    @Transactional
    public Map<String, Object> register(String email, String password, String displayName) {
        String normalizedEmail = normalize(email);
        if (users.existsByEmail(normalizedEmail))
            throw new ApiException(HttpStatus.CONFLICT, "Email is already registered");
        AppUser user = users.save(new AppUser(normalizedEmail, passwords.encode(password), displayName));
        return Map.of("id", user.getId(), "message", "User registered successfully");
    }

    @Transactional
    public Map<String, Object> login(String email, String password, HttpServletResponse response) {
        AppUser user = users.findByEmailAndActiveTrue(normalize(email)).orElse(null);
        boolean matches = user != null && StringUtils.hasText(user.getPasswordHash());
        try {
            matches = matches && passwords.matches(password, user.getPasswordHash());
        } catch (IllegalArgumentException e) {
            matches = false;
        }
        if (!matches) throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        user.recordLogin();
        users.save(user);
        add(response, "access_token", token(user, accessExpiry, "access"), accessExpiry);
        add(response, "refresh_token", token(user, refreshExpiry, "refresh"), refreshExpiry);
        return Map.of("user", userView(user));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> refresh(HttpServletRequest request, HttpServletResponse response) {
        String value = cookie(request, "refresh_token");
        if (value == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Missing refresh token");
        try {
            Jwt jwt = decoder.decode(value);
            if (!"refresh".equals(jwt.getClaimAsString("type"))) throw new JwtException("wrong token");
            AppUser user = users.findByIdAndActiveTrue(Long.valueOf(jwt.getSubject()))
                    .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh user"));
            add(response, "access_token", token(user, accessExpiry, "access"), accessExpiry);
            return Map.of("message", "Access token refreshed");
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
        }
    }

    public Map<String, Object> currentUser(Authentication auth) {
        if (auth == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
        AppUser user = users.findByIdAndActiveTrue(Long.valueOf(auth.getName()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        return Map.of("user", Map.of("id", user.getId(), "email", user.getEmail(),
                "displayName", user.getDisplayName(), "authProvider", user.getAuthProvider(), "active", user.isActive()));
    }

    public void logout(HttpServletResponse response) {
        clear(response, "access_token");
        clear(response, "refresh_token");
    }

    private Map<String, Object> userView(AppUser user) {
        return Map.of("id", user.getId(), "email", user.getEmail(), "displayName", user.getDisplayName());
    }

    private String token(AppUser user, Duration expiry, String type) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder().subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail()).claim("type", type).issuedAt(now)
                .expiresAt(now.plus(expiry)).build();
        return encoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
    }

    private void add(HttpServletResponse response, String name, String value, Duration age) {
        response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(name, value).httpOnly(true)
                .secure(secure).sameSite("Lax").path("/").maxAge(age).build().toString());
    }

    private void clear(HttpServletResponse response, String name) {
        response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(name, "")
                .path("/").maxAge(Duration.ZERO).build().toString());
    }

    private String cookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies()).filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue).findFirst().orElse(null);
    }

    private String normalize(String email) { return email.toLowerCase(Locale.ROOT); }
}
