package com.billbookmanagement.modules.system.service;
import com.billbookmanagement.modules.system.repository.HealthRepository;import org.springframework.stereotype.Service;import java.util.*;
@Service public class HealthService{private final HealthRepository repo;public HealthService(HealthRepository repo){this.repo=repo;}public Map<String,String> health(){repo.check();return Map.of("status","OK","dbStatus","Connected");}}
