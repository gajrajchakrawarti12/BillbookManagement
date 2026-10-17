package com.billbookmanagement.modules.payments.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public class PaymentRepository {
    private final JdbcTemplate db;
    public PaymentRepository(JdbcTemplate db) { this.db = db; }
    public int update(String sql, Object... args) { return db.update(sql, args); }
    public List<Map<String,Object>> list(String sql, Object... args) { return db.queryForList(sql, args); }
    public <T> T value(String sql, Class<T> type, Object... args) { return db.queryForObject(sql, type, args); }
}
