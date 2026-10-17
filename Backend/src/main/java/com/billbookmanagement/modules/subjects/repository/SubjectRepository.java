package com.billbookmanagement.modules.subjects.repository;
import org.springframework.jdbc.core.JdbcTemplate;import org.springframework.stereotype.Repository;import java.util.*;
@Repository public class SubjectRepository{
 private final JdbcTemplate db;public SubjectRepository(JdbcTemplate db){this.db=db;}
 public List<Map<String,Object>> list(long b,boolean active){return db.queryForList("SELECT * FROM subject WHERE business_id=? "+(active?"AND is_active=TRUE ":"")+"ORDER BY name",b);}
 public void create(long b,Object...v){db.update("INSERT INTO subject(business_id,subject_type,name,tax_id,vat_id,business_registration_id,email,phone) VALUES(?,?,?,?,?,?,?,?)",b,v);}
 public Map<String,Object> one(long b,long id){List<Map<String,Object>> x=db.queryForList("SELECT * FROM subject WHERE id=? AND business_id=?",id,b);if(x.isEmpty())return null;return x.getFirst();}
 public int update(long b,long id,Object...v){return db.update("UPDATE subject SET subject_type=?,name=?,tax_id=?,vat_id=?,business_registration_id=?,email=?,phone=? WHERE id=? AND business_id=?",v[0],v[1],v[2],v[3],v[4],v[5],v[6],id,b);}
 public void deactivate(long b,long id){db.update("UPDATE subject SET is_active=FALSE WHERE id=? AND business_id=?",id,b);}
 public long lastId(){return db.queryForObject("SELECT LAST_INSERT_ID()",Long.class);}
}
