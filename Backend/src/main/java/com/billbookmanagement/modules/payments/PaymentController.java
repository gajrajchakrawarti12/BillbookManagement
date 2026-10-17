package com.billbookmanagement.modules.payments;

import com.billbookmanagement.modules.payments.service.PaymentService;
import com.billbookmanagement.shared.service.TenantService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/businesses/{businessId}/payments")
public class PaymentController {
    private final PaymentService service;
    private final TenantService tenant;
    public PaymentController(PaymentService service, TenantService tenant) { this.service = service; this.tenant = tenant; }
    public record Allocation(@NotNull Long invoiceId, @NotNull @Positive BigDecimal amount) {}
    public record Request(@NotNull LocalDate paymentDate, @NotNull @Positive BigDecimal amount,
        @Pattern(regexp = "CASH|BANK_TRANSFER|CARD|CHEQUE|UPI|OTHER") String paymentMethod, String currency,
        String externalReference, String note, List<@Valid Allocation> allocations) {}
    @PostMapping
    ResponseEntity<?> create(@PathVariable Long businessId, @Valid @RequestBody Request r, Authentication a) {
        return ResponseEntity.status(201).body(service.create(businessId, tenant.userId(a), r));
    }
    @GetMapping List<Map<String,Object>> list(@PathVariable Long businessId, Authentication a) { return service.list(businessId, tenant.userId(a)); }
    @GetMapping("/{id}") Map<String,Object> get(@PathVariable Long businessId, @PathVariable Long id, Authentication a) { return service.get(businessId, id, tenant.userId(a)); }
}
