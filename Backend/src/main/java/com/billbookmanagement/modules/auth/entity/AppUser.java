package com.billbookmanagement.modules.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_user")
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 254, unique = true)
    private String email;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(name = "display_name", nullable = false, length = 160)
    private String displayName;

    @Column(name = "auth_provider", nullable = false, length = 40)
    private String authProvider = "LOCAL";

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    protected AppUser() {}

    public AppUser(String email, String passwordHash, String displayName) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.displayName = displayName;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getDisplayName() { return displayName; }
    public String getAuthProvider() { return authProvider; }
    public boolean isActive() { return active; }
    public void recordLogin() { this.lastLoginAt = LocalDateTime.now(); }
}
