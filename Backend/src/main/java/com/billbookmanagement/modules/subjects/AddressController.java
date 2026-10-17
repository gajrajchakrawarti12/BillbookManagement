package com.billbookmanagement.modules.subjects;

import com.billbookmanagement.modules.subjects.service.AddressService;
import com.billbookmanagement.shared.service.TenantService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/businesses/{businessId}/subjects/{subjectId}/addresses")
public class AddressController {
    private final AddressService service;
    private final TenantService tenant;

    public AddressController(AddressService s, TenantService t) {
        service = s;
        tenant = t;
    }

    public record Request(@NotBlank String addressLine1, String addressLine2, String streetNumber,
            @NotBlank String city, String region, String postalCode,
            @NotBlank @Pattern(regexp = "[A-Z]{2}") String countryCode, String addressType, Boolean isDefault,
            LocalDate validFrom, LocalDate validTo) {
    }

    @GetMapping
    List<Map<String, Object>> list(@PathVariable Long businessId, @PathVariable Long subjectId, Authentication a) {
        return service.list(tenant.userId(a), businessId, subjectId);
    }

    @PostMapping
    ResponseEntity<?> create(@PathVariable Long businessId, @PathVariable Long subjectId, @Valid @RequestBody Request r,
            Authentication a) {
        return ResponseEntity.status(201)
                .body(service.create(tenant.userId(a), businessId, subjectId, r.addressLine1(), r.addressLine2(),
                        r.streetNumber(), r.city(), r.region(), r.postalCode(), r.countryCode(), r.addressType(),
                        r.isDefault(), r.validFrom(), r.validTo()));
    }

    @DeleteMapping("/{addressId}")
    ResponseEntity<?> delete(@PathVariable Long businessId, @PathVariable Long subjectId, @PathVariable Long addressId,
            Authentication a) {
        service.delete(tenant.userId(a), businessId, subjectId, addressId);
        return ResponseEntity.ok(Map.of("message", "Address deleted"));
    }
}
