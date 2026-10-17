package com.billbookmanagement.shared.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class TenantService {
    private final JdbcTemplate db;
    public TenantService(JdbcTemplate db) { this.db = db; }

    public Long userId(Authentication auth) {
        if (auth == null || auth.getName() == null) throw new ApiException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Authentication required");
        try { return Long.valueOf(auth.getName()); }
        catch (NumberFormatException e) { throw new ApiException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Invalid user identity"); }
    }
    public void requireBusiness(Long userId, Long businessId, String... roles) {
        if (db.queryForObject("SELECT COUNT(*) FROM business WHERE id=? AND is_active=TRUE", Long.class, businessId) == 0)
            throw new ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Business not found");
        String role = db.query("SELECT role FROM business_membership WHERE business_id=? AND user_id=? AND is_active=TRUE",
            rs -> rs.next() ? rs.getString(1) : null, businessId, userId);
        if (role == null || (roles.length > 0 && Arrays.stream(roles).noneMatch(role::equals)))
            throw new ApiException(org.springframework.http.HttpStatus.FORBIDDEN, "You do not have access to this business");
    }
    public Map<String,Object> one(String table, Long id, Long businessId) {
        List<Map<String,Object>> rows = db.queryForList("SELECT * FROM " + table + " WHERE id=? AND business_id=?", id, businessId);
        if (rows.isEmpty()) throw new ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Resource not found");
        return rows.getFirst();
    }
    public void audit(Long businessId, Long actor, String action, String type, Object id) {
        db.update("INSERT INTO audit_log (business_id,actor_user_id,action,entity_type,entity_id) VALUES (?,?,?,?,?)",
            businessId, actor, action, type, String.valueOf(id));
    }
}
