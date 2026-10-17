package com.billbookmanagement.security;

import jakarta.servlet.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationProvider;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class CookieJwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtDecoder decoder;
    public CookieJwtAuthenticationFilter(JwtDecoder decoder) { this.decoder = decoder; }
    @Override protected void doFilterInternal(HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response,
                                               FilterChain chain) throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() == null && request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) {
                    try {
                        Jwt jwt = decoder.decode(cookie.getValue());
                        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(jwt));
                    } catch (JwtException ignored) {
                        // The endpoint will return 401; invalid cookies must never be trusted.
                    }
                    break;
                }
            }
        }
        chain.doFilter(request, response);
    }
}
