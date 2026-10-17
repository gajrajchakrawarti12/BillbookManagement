package com.billbookmanagement.modules.dashboard.repository;
import org.springframework.jdbc.core.JdbcTemplate;import org.springframework.stereotype.Repository;import java.math.BigDecimal;import java.util.*;
@Repository public class DashboardRepository {
 private final JdbcTemplate db; public DashboardRepository(JdbcTemplate db){this.db=db;}
 public Map<String,Object> summary(long id){return Map.of("business",db.queryForMap("SELECT * FROM business WHERE id=?",id),"customers",db.queryForObject("SELECT COUNT(*) FROM subject WHERE business_id=? AND is_active=TRUE",Long.class,id),"products",db.queryForObject("SELECT COUNT(*) FROM product WHERE business_id=? AND is_active=TRUE",Long.class,id),"invoices",db.queryForObject("SELECT COUNT(*) FROM invoice WHERE business_id=?",Long.class,id),"issuedAmount",db.queryForObject("SELECT COALESCE(SUM(total_incl_tax),0) FROM invoice WHERE business_id=? AND status_id=2",BigDecimal.class,id),"paidInvoices",db.queryForObject("SELECT COUNT(*) FROM invoice WHERE business_id=? AND is_paid=TRUE",Long.class,id));}
}
