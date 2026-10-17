package com.billbookmanagement.modules.subjects;

import com.billbookmanagement.modules.subjects.service.SubjectService;
import com.billbookmanagement.shared.service.TenantService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/businesses/{businessId}/subjects")
public class SubjectController {
    private final SubjectService service;
    private final TenantService tenant;

    public SubjectController(SubjectService s, TenantService t) {
        service = s;
        tenant = t;
    }

    public record Request(@NotBlank String name, @NotNull String subjectType, String taxId, String vatId,
            String businessRegistrationId, @Email String email, String phone) {
    }

    @GetMapping
    List<Map<String, Object>> list(@PathVariable Long businessId, @RequestParam(defaultValue = "false") boolean active,
            Authentication a) {
        return service.list(tenant.userId(a), businessId, active);
    }

    @PostMapping
    ResponseEntity<?> create(@PathVariable Long businessId, @Valid @RequestBody Request r, Authentication a) {
        return ResponseEntity.status(201).body(service.create(tenant.userId(a), businessId, r.subjectType(), r.name(),
                r.taxId(), r.vatId(), r.businessRegistrationId(), r.email(), r.phone()));
    }

    @GetMapping("/{id}")
    Map<String, Object> get(@PathVariable Long businessId, @PathVariable Long id, Authentication a) {
        return service.get(tenant.userId(a), businessId, id);
    }

    @PutMapping("/{id}")
    Map<String, Object> update(@PathVariable Long businessId, @PathVariable Long id, @Valid @RequestBody Request r,
            Authentication a) {
        return service.update(tenant.userId(a), businessId, id, r.subjectType(), r.name(), r.taxId(), r.vatId(),
                r.businessRegistrationId(), r.email(), r.phone());
    }

    @DeleteMapping("/{id}")
    ResponseEntity<?> delete(@PathVariable Long businessId, @PathVariable Long id, Authentication a) {
        service.delete(tenant.userId(a), businessId, id);
        return ResponseEntity.ok(Map.of("message", "Subject disabled"));
    }
}
