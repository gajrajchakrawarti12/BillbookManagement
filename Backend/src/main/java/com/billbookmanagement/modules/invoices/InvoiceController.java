package com.billbookmanagement.modules.invoices;

import com.billbookmanagement.modules.invoices.service.InvoiceService;
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
@RequestMapping("/api/businesses/{businessId}/invoices")
public class InvoiceController {
    private final InvoiceService service;
    private final TenantService tenant;

    public InvoiceController(InvoiceService service, TenantService tenant) {
        this.service = service;
        this.tenant = tenant;
    }

    public record Line(@Positive Long productId, String description, String unitOfMeasure, @NotNull @Positive @Digits(integer = 12, fraction = 4) BigDecimal quantity,
            @NotNull @PositiveOrZero @Digits(integer = 15, fraction = 4) BigDecimal unitPrice, @NotNull @PositiveOrZero @Digits(integer = 15, fraction = 4) BigDecimal discountAmount,
            @NotNull @DecimalMin("0") @DecimalMax("100") BigDecimal taxRate) {
    }

    public record Request(@NotBlank @Size(max = 50) String invoiceNumber, String documentType, Long issuerSubjectId,
            @NotNull Long buyerSubjectId, Long creditedInvoiceId, LocalDate issueDate, LocalDate dueDate,
            @Pattern(regexp = "[A-Z]{3}") String currency, String note, String reference,
            @NotBlank String issuerNameSnapshot, @NotBlank String buyerNameSnapshot,
            @NotEmpty List<@Valid Line> items) {
    }

    @PostMapping
    ResponseEntity<?> create(@PathVariable Long businessId, @Valid @RequestBody Request r, Authentication a) {
        return ResponseEntity.status(201).body(service.create(businessId, tenant.userId(a), r));
    }

    @GetMapping
    List<Map<String, Object>> list(@PathVariable Long businessId, @RequestParam(required = false) String status,
            Authentication a) {
        return service.list(businessId, tenant.userId(a), status);
    }

    @GetMapping("/{id}")
    Map<String, Object> get(@PathVariable Long businessId, @PathVariable Long id, Authentication a) {
        return service.get(businessId, id, tenant.userId(a));
    }

    @PostMapping("/{id}/issue")
    Map<String, Object> issue(@PathVariable Long businessId, @PathVariable Long id, Authentication a) {
        return service.changeStatus(businessId, id, 2, "ISSUE", tenant.userId(a));
    }

    @PostMapping("/{id}/void")
    Map<String, Object> voidInvoice(@PathVariable Long businessId, @PathVariable Long id, Authentication a) {
        return service.changeStatus(businessId, id, 5, "VOID", tenant.userId(a));
    }

    @PostMapping("/{id}/credit")
    ResponseEntity<?> credit(@PathVariable Long businessId, @PathVariable Long id, @Valid @RequestBody Request r,
            Authentication a) {
        if (!Objects.equals(r.creditedInvoiceId(), id))
            throw new com.billbookmanagement.shared.service.ApiException(HttpStatus.BAD_REQUEST,
                    "creditedInvoiceId must reference the original invoice");
        if (!"CREDIT_NOTE".equals(r.documentType()))
            throw new com.billbookmanagement.shared.service.ApiException(HttpStatus.BAD_REQUEST,
                    "Credit documents must use documentType CREDIT_NOTE");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.createCredit(businessId, id, tenant.userId(a), r));
    }
}
