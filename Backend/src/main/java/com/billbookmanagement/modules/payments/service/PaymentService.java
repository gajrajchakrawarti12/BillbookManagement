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

        String currency = r.currency() == null ? "INR" : r.currency().trim();
        if (!currency.matches("[A-Z]{3}")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Currency must be a three-letter uppercase code");
        }
        if (r.amount() == null || r.amount().signum() <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Payment amount must be greater than zero");
        }

        // Merge repeated invoice IDs and process locks in a stable order to reduce deadlocks.
        Map<Long, BigDecimal> requestedByInvoice = new TreeMap<>();
        for (Allocation allocation : Optional.ofNullable(r.allocations()).orElse(List.of())) {
            if (allocation.invoiceId() == null || allocation.amount() == null
                    || allocation.amount().signum() <= 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Each allocation needs an invoice and a positive amount");
            }
            requestedByInvoice.merge(allocation.invoiceId(), allocation.amount(), BigDecimal::add);
        }

        BigDecimal totalAllocated = requestedByInvoice.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (totalAllocated.compareTo(r.amount()) > 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Allocations exceed payment amount");
        }

        repo.update(
                "INSERT INTO payment(business_id,payment_date,amount,currency,payment_method,external_reference,note,created_by) VALUES(?,?,?,?,?,?,?,?)",
                businessId, r.paymentDate(), r.amount(), currency,
                r.paymentMethod() == null ? "OTHER" : r.paymentMethod(), r.externalReference(), r.note(), user);
        long paymentId = repo.value("SELECT LAST_INSERT_ID()", Long.class);

        for (Map.Entry<Long, BigDecimal> allocation : requestedByInvoice.entrySet()) {
            long invoiceId = allocation.getKey();
            BigDecimal amount = allocation.getValue();

            // Lock the invoice before checking its balance. Concurrent payment requests for
            // the same invoice will serialize here instead of both spending the same balance.
            List<Map<String, Object>> invoices = repo.list(
                    "SELECT total_incl_tax,currency,status_id FROM invoice " +
                    "WHERE id=? AND business_id=? FOR UPDATE",
                    invoiceId, businessId);
            if (invoices.isEmpty()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invoice does not belong to this business");
            }

            Map<String, Object> invoice = invoices.getFirst();
            if (((Number) invoice.get("status_id")).intValue() != 2) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Only issued invoices can receive payments");
            }
            String invoiceCurrency = String.valueOf(invoice.get("currency"));
            if (!currency.equals(invoiceCurrency)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Payment and invoice currencies must match");
            }

            BigDecimal invoiceTotal = (BigDecimal) invoice.get("total_incl_tax");
            BigDecimal alreadyAllocated = repo.value(
                    "SELECT COALESCE(SUM(pa.allocated_amount),0) " +
                    "FROM payment_allocation pa JOIN payment p ON p.id=pa.payment_id " +
                    "WHERE pa.invoice_id=? AND p.business_id=?",
                    BigDecimal.class, invoiceId, businessId);
            BigDecimal outstanding = invoiceTotal.subtract(alreadyAllocated);
            if (amount.compareTo(outstanding) > 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "Allocation exceeds the invoice's outstanding balance");
            }

            repo.update(
                    "INSERT INTO payment_allocation(payment_id,invoice_id,allocated_amount) VALUES(?,?,?)",
                    paymentId, invoiceId, amount);
            BigDecimal newlyAllocated = alreadyAllocated.add(amount);
            repo.update("UPDATE invoice SET is_paid=? WHERE id=? AND business_id=?",
                    newlyAllocated.compareTo(invoiceTotal) >= 0, invoiceId, businessId);
        }

        tenant.audit(businessId, user, "CREATE", "PAYMENT", paymentId);
        return detail(businessId, paymentId);
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
        List<Map<String, Object>> rows = repo.list(
                "SELECT * FROM payment WHERE id=? AND business_id=?", id, businessId);
        if (rows.isEmpty()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Payment not found");
        }
        Map<String, Object> result = new HashMap<>(rows.getFirst());
        result.put("allocations", repo.list("SELECT * FROM payment_allocation WHERE payment_id=? ORDER BY invoice_id", id));
        result.put("allocatedAmount", repo.value(
                "SELECT COALESCE(SUM(allocated_amount),0) FROM payment_allocation WHERE payment_id=?",
                BigDecimal.class, id));
        return result;
    }
}
