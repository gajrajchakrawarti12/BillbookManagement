package com.billbookmanagement.modules.products;

import com.billbookmanagement.modules.products.service.ProductService;
import com.billbookmanagement.shared.service.TenantService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/businesses/{businessId}/products")
public class ProductController {
    private final ProductService service;
    private final TenantService tenant;

    public ProductController(ProductService s, TenantService t) {
        service = s;
        tenant = t;
    }

    public record Request(@NotBlank @Size(max = 40) String productCode, @NotBlank @Size(max = 200) String name,
            String description, String unitOfMeasure, @NotNull @PositiveOrZero BigDecimal currentUnitPrice,
            @NotNull @DecimalMin("0") @DecimalMax("100") BigDecimal defaultTaxRate, Boolean active) {
    }

    @GetMapping
    List<Map<String, Object>> list(@PathVariable Long businessId, Authentication a) {
        return service.list(tenant.userId(a), businessId);
    }

    @PostMapping
    ResponseEntity<?> create(@PathVariable Long businessId, @Valid @RequestBody Request r, Authentication a) {
        return ResponseEntity.status(201)
                .body(service.create(tenant.userId(a), businessId, r.productCode(), r.name(), r.description(),
                        r.unitOfMeasure() == null ? "unit" : r.unitOfMeasure(), r.currentUnitPrice(),
                        r.defaultTaxRate(), r.active() == null || r.active()));
    }

    @GetMapping("/{id}")
    Map<String, Object> get(@PathVariable Long businessId, @PathVariable Long id, Authentication a) {
        return service.get(tenant.userId(a), businessId, id);
    }

    @PutMapping("/{id}")
    Map<String, Object> update(@PathVariable Long businessId, @PathVariable Long id, @Valid @RequestBody Request r,
            Authentication a) {
        return service.update(tenant.userId(a), businessId, id, r.productCode(), r.name(), r.description(),
                r.unitOfMeasure(), r.currentUnitPrice(), r.defaultTaxRate(), r.active() == null || r.active());
    }
}
