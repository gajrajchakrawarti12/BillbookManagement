package com.billbookmanagement.modules.reference.repository;
import org.springframework.jdbc.core.JdbcTemplate;import org.springframework.stereotype.Repository;import java.util.*;
@Repository public class CountryRepository{private final JdbcTemplate db;public CountryRepository(JdbcTemplate db){this.db=db;}public List<Map<String,Object>> findAll(){return db.queryForList("SELECT code,name FROM country ORDER BY name");}}
