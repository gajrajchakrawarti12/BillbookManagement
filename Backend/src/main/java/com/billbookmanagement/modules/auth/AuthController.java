package com.billbookmanagement.modules.auth;

import com.billbookmanagement.modules.auth.service.AuthService;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    public AuthController(AuthService auth) { this.auth = auth; }

    public record Register(@NotBlank @Email String email, @NotBlank @Size(min = 8) String password,
            @NotBlank String displayName) {}
    public record Login(@NotBlank @Email String email, @NotBlank String password) {}

    @PostMapping("/register")
    ResponseEntity<?> register(@Valid @RequestBody Register request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(auth.register(request.email(), request.password(), request.displayName()));
    }

    @PostMapping("/login")
    ResponseEntity<?> login(@Valid @RequestBody Login request, HttpServletResponse response) {
        return ResponseEntity.ok(auth.login(request.email(), request.password(), response));
    }

    @PostMapping("/refresh")
    ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
        return ResponseEntity.ok(auth.refresh(request, response));
    }

    @PostMapping("/logout")
    ResponseEntity<?> logout(HttpServletResponse response) {
        auth.logout(response);
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }

    @GetMapping("/me")
    Map<String, Object> me(Authentication authentication) {
        return auth.currentUser(authentication);
    }
}
