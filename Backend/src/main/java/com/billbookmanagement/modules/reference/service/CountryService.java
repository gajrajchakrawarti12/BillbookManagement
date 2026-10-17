package com.billbookmanagement.modules.reference.service;
import com.billbookmanagement.modules.reference.repository.CountryRepository;import org.springframework.stereotype.Service;import java.util.*;
@Service public class CountryService{private final CountryRepository repo;public CountryService(CountryRepository repo){this.repo=repo;}public List<Map<String,Object>> list(){return repo.findAll();}}
