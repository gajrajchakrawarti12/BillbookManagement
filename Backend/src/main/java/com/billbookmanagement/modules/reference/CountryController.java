package com.billbookmanagement.modules.reference;
import com.billbookmanagement.modules.reference.service.CountryService;import org.springframework.web.bind.annotation.*;import java.util.*;
@RestController @RequestMapping("/api/countries") public class CountryController{private final CountryService service;public CountryController(CountryService s){service=s;}@GetMapping List<Map<String,Object>> list(){return service.list();}}
