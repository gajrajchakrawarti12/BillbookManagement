package com.billbookmanagement.modules.business;

import com.billbookmanagement.modules.business.service.BusinessService;
import com.billbookmanagement.shared.service.TenantService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/businesses")
public class BusinessController {
    private final BusinessService service;
    private final TenantService tenant;

    public BusinessController(BusinessService s, TenantService t) {
        service = s;
        tenant = t;
    }

    public record Create(@NotBlank @Size(max = 200) String legalName, String displayName, String businessRegistrationId,
            @Pattern(regexp = "[A-Z]{3}") String defaultCurrency) {
    }

    public record Membership(Long userId, @NotNull String role) {
    }

    @PostMapping
    ResponseEntity<?> create(@Valid @RequestBody Create r, Authentication a) {
        return ResponseEntity.status(201).body(service.create(tenant.userId(a), r.legalName(), r.displayName(),
                r.businessRegistrationId(), r.defaultCurrency() == null ? "INR" : r.defaultCurrency()));
    }

    @GetMapping
    List<Map<String, Object>> list(Authentication a) {
        return service.list(tenant.userId(a));
    }

    @GetMapping("/{id}")
    Map<String, Object> get(@PathVariable Long id, Authentication a) {
        return service.get(tenant.userId(a), id);
    }

    @PostMapping("/{id}/members")
    ResponseEntity<?> add(@PathVariable Long id, @Valid @RequestBody Membership r, Authentication a) {
        service.addMember(tenant.userId(a), id, r.userId(), r.role());
        return ResponseEntity.status(201).body(Map.of("message", "Membership added"));
    }

    @DeleteMapping("/{id}/members/{userId}")
    ResponseEntity<?> remove(@PathVariable Long id, @PathVariable Long userId, Authentication a) {
        service.removeMember(tenant.userId(a), id, userId);
        return ResponseEntity.ok(Map.of("message", "Membership disabled"));
    }
}
