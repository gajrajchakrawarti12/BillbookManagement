package com.billbookmanagement.modules.payments.service;

import com.billbookmanagement.modules.payments.PaymentController.*;
import com.billbookmanagement.modules.payments.repository.PaymentRepository;
import com.billbookmanagement.shared.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.*;

@Service
public class PaymentService {
    private final PaymentRepository repo;
    private final TenantService tenant;

    public PaymentService(PaymentRepository repo, TenantService tenant) {
        this.repo = repo;
        this.tenant = tenant;
    }

    @Transactional
    public Map<String, Object> create(long businessId, long user, Request r) {
        tenant.requireBusiness(user, businessId, "OWNER", "ADMIN", "ACCOUNTANT");
        List<Allocation> allocations = Optional.ofNullable(r.allocations()).orElse(List.of());
        BigDecimal allocated = allocations.stream().map(Allocation::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (allocated.compareTo(r.amount()) > 0)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Allocations exceed payment amount");
        repo.update(
                "INSERT INTO payment(business_id,payment_date,amount,currency,payment_method,external_reference,note,created_by) VALUES(?,?,?,?,?,?,?,?)",
                businessId, r.paymentDate(), r.amount(), r.currency() == null ? "INR" : r.currency(),
                r.paymentMethod() == null ? "OTHER" : r.paymentMethod(), r.externalReference(), r.note(), user);
        long id = repo.value("SELECT LAST_INSERT_ID()", Long.class);
        for (Allocation a : allocations) {
            List<Map<String, Object>> invoice = repo.list(
                    "SELECT total_incl_tax,is_paid FROM invoice WHERE id=? AND business_id=? AND status_id=2",
                    a.invoiceId(), businessId);
            if (invoice.isEmpty())
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "Only issued invoices in this business can receive payments");
            BigDecimal already = repo.value(
                    "SELECT COALESCE(SUM(allocated_amount),0) FROM payment_allocation WHERE invoice_id=?",
                    BigDecimal.class, a.invoiceId());
            if (already.add(a.amount()).compareTo((BigDecimal) invoice.getFirst().get("total_incl_tax")) > 0)
                throw new ApiException(HttpStatus.BAD_REQUEST, "Allocation exceeds invoice balance");
            repo.update("INSERT INTO payment_allocation(payment_id,invoice_id,allocated_amount) VALUES(?,?,?)", id,
                    a.invoiceId(), a.amount());
            BigDecimal total = repo.value("SELECT total_incl_tax FROM invoice WHERE id=?", BigDecimal.class,
                    a.invoiceId());
            repo.update(
                    "UPDATE invoice SET is_paid=(SELECT COALESCE(SUM(allocated_amount),0)>=? FROM payment_allocation WHERE invoice_id=?) WHERE id=?",
                    total, a.invoiceId(), a.invoiceId());
        }
        tenant.audit(businessId, user, "CREATE", "PAYMENT", id);
        return detail(businessId, id);
    }

    public List<Map<String, Object>> list(long businessId, long user) {
        tenant.requireBusiness(user, businessId);
        return repo.list("SELECT * FROM payment WHERE business_id=? ORDER BY payment_date DESC,id DESC", businessId);
    }

    public Map<String, Object> get(long businessId, long id, long user) {
        tenant.requireBusiness(user, businessId);
        return detail(businessId, id);
    }

    private Map<String, Object> detail(long businessId, long id) {
        List<Map<String, Object>> rows = repo.list("SELECT * FROM payment WHERE id=? AND business_id=?", id,
                businessId);
        if (rows.isEmpty())
            throw new ApiException(HttpStatus.NOT_FOUND, "Payment not found");
        Map<String, Object> result = new HashMap<>(rows.getFirst());
        result.put("allocations", repo.list("SELECT * FROM payment_allocation WHERE payment_id=?", id));
        result.put("allocatedAmount", repo.value(
                "SELECT COALESCE(SUM(allocated_amount),0) FROM payment_allocation WHERE payment_id=?",
                BigDecimal.class, id));
        return result;
    }
}
