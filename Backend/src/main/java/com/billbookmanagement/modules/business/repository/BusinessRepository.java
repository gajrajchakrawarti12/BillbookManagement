package com.billbookmanagement.modules.business.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import java.sql.Statement;
import java.util.*;

@Repository
public class BusinessRepository {
    private final JdbcTemplate db;
    public BusinessRepository(JdbcTemplate db) { this.db = db; }
    public long create(String legalName, String displayName, String registration, String currency) {
        KeyHolder key = new GeneratedKeyHolder();
        db.update(c -> { var p=c.prepareStatement("INSERT INTO business(legal_name,display_name,business_registration_id,default_currency) VALUES(?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
            p.setString(1,legalName); p.setString(2,displayName); p.setString(3,registration); p.setString(4,currency); return p; }, key);
        return key.getKey().longValue();
    }
    public Map<String,Object> find(long id) { return db.queryForMap("SELECT * FROM business WHERE id=?", id); }
    public List<Map<String,Object>> findForUser(long user) { return db.queryForList("SELECT b.*,m.role FROM business b JOIN business_membership m ON m.business_id=b.id WHERE m.user_id=? AND m.is_active=TRUE ORDER BY b.id",user); }
    public void addMember(long business,long user,String role) { db.update("INSERT INTO business_membership(business_id,user_id,role) VALUES(?,?,?) ON DUPLICATE KEY UPDATE role=?,is_active=TRUE",business,user,role,role); }
    public void disableMember(long business,long user) { db.update("UPDATE business_membership SET is_active=FALSE WHERE business_id=? AND user_id=?",business,user); }
}
