package com.billbookmanagement.modules.system;
import com.billbookmanagement.modules.system.service.HealthService;import org.springframework.web.bind.annotation.*;import java.util.*;
@RestController public class HealthController{private final HealthService service;public HealthController(HealthService s){service=s;}@GetMapping("/health") public Map<String,String> health(){return service.health();}}
