package com.billbookmanagement.modules.invoices.service;

import com.billbookmanagement.modules.invoices.repository.InvoiceRepository;
import com.billbookmanagement.modules.invoices.InvoiceController.Line;
import com.billbookmanagement.modules.invoices.InvoiceController.Request;
import com.billbookmanagement.shared.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.support.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.*;
import java.sql.*;
import java.util.*;

@Service
public class InvoiceService {
    private final InvoiceRepository repo;
    private final TenantService tenant;

    public InvoiceService(InvoiceRepository repo, TenantService tenant) {
        this.repo = repo;
        this.tenant = tenant;
    }

    @Transactional
    public Map<String, Object> create(long businessId, long user, Request r) {
        tenant.requireBusiness(user, businessId, "OWNER", "ADMIN", "ACCOUNTANT", "STAFF");
        if (r.dueDate() != null && r.issueDate() != null && r.dueDate().isBefore(r.issueDate()))
            throw new ApiException(HttpStatus.BAD_REQUEST, "Due date cannot precede issue date");
        subject(businessId, r.buyerSubjectId(), "Buyer");
        if (r.issuerSubjectId() != null)
            subject(businessId, r.issuerSubjectId(), "Issuer");
        BigDecimal excl = BigDecimal.ZERO, tax = BigDecimal.ZERO;
        for (Line l : r.items()) {
            BigDecimal gross = l.quantity().multiply(l.unitPrice());
            if (l.discountAmount().compareTo(gross) > 0)
                throw new ApiException(HttpStatus.BAD_REQUEST, "Discount exceeds line amount");
            BigDecimal net = gross.subtract(l.discountAmount());
            excl = excl.add(net);
            tax = tax.add(net.multiply(l.taxRate()).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
        }
        BigDecimal total = excl.add(tax);
        final BigDecimal finalExcl = excl;
        final BigDecimal finalTax = tax;
        final BigDecimal finalTotal = total;
        KeyHolder key = new GeneratedKeyHolder();
        repo.jdbc().update(c -> {
            PreparedStatement p = c.prepareStatement(
                    "INSERT INTO invoice(business_id,invoice_number,document_type,issuer_subject_id,buyer_subject_id,credited_invoice_id,status_id,issue_date,due_date,currency,note,reference,issuer_name_snapshot,buyer_name_snapshot,total_excl_tax,total_tax,total_incl_tax,created_by) VALUES(?,?,?,?,?,?,1,?,?,?,?,?,?,?,?,?,?)",
                    Statement.RETURN_GENERATED_KEYS);
            int i = 1;
            p.setLong(i++, businessId);
            p.setString(i++, r.invoiceNumber());
            p.setString(i++, r.documentType() == null ? "INVOICE" : r.documentType());
            set(p, i++, r.issuerSubjectId());
            p.setLong(i++, r.buyerSubjectId());
            set(p, i++, r.creditedInvoiceId());
            p.setObject(i++, r.issueDate());
            p.setObject(i++, r.dueDate());
            p.setString(i++, r.currency() == null ? "INR" : r.currency());
            p.setString(i++, r.note());
            p.setString(i++, r.reference());
            p.setString(i++, r.issuerNameSnapshot());
            p.setString(i++, r.buyerNameSnapshot());
            p.setBigDecimal(i++, finalExcl);
            p.setBigDecimal(i++, finalTax);
            p.setBigDecimal(i++, finalTotal);
            p.setLong(i, user);
            return p;
        }, key);
        long id = key.getKey().longValue();
        repo.update(
                "INSERT INTO invoice_status_history(invoice_id,old_status_id,new_status_id,changed_by,reason) VALUES(?,?,?,?,?)",
                id, null, 1, user, "CREATE_DRAFT");
        int line = 1;
        for (Line l : r.items()) {
            BigDecimal net = l.quantity().multiply(l.unitPrice()).subtract(l.discountAmount());
            BigDecimal lineTax = net.multiply(l.taxRate()).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            String code = null;
            if (l.productId() != null)
                code = (String) product(businessId, l.productId()).get("product_code");
            repo.update(
                    "INSERT INTO invoice_item(invoice_id,line_number,product_id,product_code_snapshot,description_snapshot,unit_of_measure_snapshot,quantity,unit_price,discount_amount,net_amount,tax_rate,tax_amount,gross_amount) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
                    id, line++, l.productId(), code, l.description(),
                    l.unitOfMeasure() == null ? "unit" : l.unitOfMeasure(),
                    l.quantity(), l.unitPrice(), l.discountAmount(), net, l.taxRate(), lineTax, net.add(lineTax));
        }
        tenant.audit(businessId, user, "CREATE", "INVOICE", id);
        return detail(businessId, id);
    }

    public List<Map<String, Object>> list(long businessId, Long user, String status) {
        tenant.requireBusiness(user, businessId);
        String sql = "SELECT i.*,s.code AS status_code FROM invoice i JOIN invoice_status s ON s.id=i.status_id WHERE i.business_id=?";
        List<Object> args = new ArrayList<>(List.of(businessId));
        if (status != null) {
            sql += " AND s.code=?";
            args.add(status);
        }
        return repo.list(sql + " ORDER BY i.created_at DESC", args.toArray());
    }

    public Map<String, Object> get(long businessId, long id, long user) {
        tenant.requireBusiness(user, businessId);
        return detail(businessId, id);
    }

    @Transactional
    public Map<String, Object> createCredit(long businessId, long originalInvoiceId, long user, Request r) {
        tenant.requireBusiness(user, businessId, "OWNER", "ADMIN", "ACCOUNTANT");
        if (!Objects.equals(r.creditedInvoiceId(), originalInvoiceId)
                || !"CREDIT_NOTE".equals(r.documentType())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Credit note must reference the original invoice");
        }

        List<Map<String, Object>> originals = repo.list(
                "SELECT * FROM invoice WHERE id=? AND business_id=? FOR UPDATE",
                originalInvoiceId, businessId);
        if (originals.isEmpty()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Original invoice not found");
        }
        Map<String, Object> original = originals.getFirst();
        int originalStatus = ((Number) original.get("status_id")).intValue();
        if (!"INVOICE".equals(original.get("document_type")) || (originalStatus != 2 && originalStatus != 3)) {
            throw new ApiException(HttpStatus.CONFLICT, "Only issued, non-void invoices can be credited");
        }
        if (!Objects.equals(((Number) original.get("buyer_subject_id")).longValue(), r.buyerSubjectId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Credit note buyer must match the original invoice");
        }

        String originalCurrency = String.valueOf(original.get("currency"));
        if (r.currency() != null && !originalCurrency.equals(r.currency())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Credit note currency must match the original invoice");
        }

        BigDecimal requestedCredit = BigDecimal.ZERO;
        for (Line line : r.items()) {
            BigDecimal lineGross = line.quantity().multiply(line.unitPrice());
            if (line.discountAmount().compareTo(lineGross) > 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Discount exceeds line amount");
            }
            BigDecimal net = lineGross.subtract(line.discountAmount());
            BigDecimal lineTax = net.multiply(line.taxRate())
                    .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            requestedCredit = requestedCredit.add(net).add(lineTax);
        }

        BigDecimal existingCredits = repo.value(
                "SELECT COALESCE(SUM(i.total_incl_tax),0) FROM invoice i " +
                "JOIN invoice_status s ON s.id=i.status_id " +
                "WHERE i.business_id=? AND i.credited_invoice_id=? " +
                "AND i.document_type='CREDIT_NOTE' AND s.code <> 'VOID'",
                BigDecimal.class, businessId, originalInvoiceId);
        BigDecimal originalTotal = (BigDecimal) original.get("total_incl_tax");
        if (existingCredits.add(requestedCredit).compareTo(originalTotal) > 0) {
            throw new ApiException(HttpStatus.CONFLICT, "Credit notes cannot exceed the original invoice total");
        }
        Request normalized = new Request(r.invoiceNumber(), r.documentType(), r.issuerSubjectId(),
                r.buyerSubjectId(), r.creditedInvoiceId(), r.issueDate(), r.dueDate(), originalCurrency,
                r.note(), r.reference(), r.issuerNameSnapshot(), r.buyerNameSnapshot(), r.items());
        return create(businessId, user, normalized);
    }

    @Transactional
    public Map<String, Object> changeStatus(long b, long id, int status, String action, long user) {
        tenant.requireBusiness(user, b, "OWNER", "ADMIN", "ACCOUNTANT");
        List<Map<String, Object>> lockedRows = repo.list(
                "SELECT i.*,s.code AS status_code FROM invoice i " +
                "JOIN invoice_status s ON s.id=i.status_id WHERE i.id=? AND i.business_id=? FOR UPDATE",
                id, b);
        if (lockedRows.isEmpty()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Invoice not found");
        }
        Map<String, Object> old = new HashMap<>(lockedRows.getFirst());
        int oldStatus = ((Number) old.get("status_id")).intValue();

        if (status == 2 && oldStatus != 1) {
            throw new ApiException(HttpStatus.CONFLICT, "Only draft invoices can be issued");
        }
        if (status == 5 && oldStatus != 1 && oldStatus != 2) {
            throw new ApiException(HttpStatus.CONFLICT, "Only draft or issued invoices can be voided");
        }
        if (status == 5) {
            long pendingCredits = repo.value(
                    "SELECT COUNT(*) FROM invoice WHERE business_id=? AND credited_invoice_id=? " +
                    "AND document_type='CREDIT_NOTE' AND status_id<>5",
                    Long.class, b, id);
            if (pendingCredits > 0) {
                throw new ApiException(HttpStatus.CONFLICT,
                        "An invoice with active credit notes cannot be voided");
            }
        }

        Long originalId = old.get("credited_invoice_id") == null
                ? null : ((Number) old.get("credited_invoice_id")).longValue();
        if (status == 2 && "CREDIT_NOTE".equals(old.get("document_type"))) {
            if (originalId == null) {
                throw new ApiException(HttpStatus.CONFLICT, "Credit note has no original invoice");
            }
            List<Map<String, Object>> originals = repo.list(
                    "SELECT * FROM invoice WHERE id=? AND business_id=? FOR UPDATE", originalId, b);
            if (originals.isEmpty()) {
                throw new ApiException(HttpStatus.CONFLICT, "Original invoice is no longer available");
            }
            int originalStatus = ((Number) originals.getFirst().get("status_id")).intValue();
            if (originalStatus != 2 && originalStatus != 3) {
                throw new ApiException(HttpStatus.CONFLICT, "Original invoice cannot accept a credit note");
            }
        }

        repo.update(
                "UPDATE invoice SET status_id=?,issue_date=COALESCE(issue_date,CURDATE())," +
                "issued_at=COALESCE(issued_at,NOW(6)) WHERE id=? AND business_id=?",
                status, id, b);
        repo.update(
                "INSERT INTO invoice_status_history(invoice_id,old_status_id,new_status_id,changed_by,reason) VALUES(?,?,?,?,?)",
                id, oldStatus, status, user, action);
        tenant.audit(b, user, action, "INVOICE", id);

        if (status == 2 && originalId != null && "CREDIT_NOTE".equals(old.get("document_type"))) {
            List<Map<String, Object>> originals = repo.list(
                    "SELECT total_incl_tax,status_id FROM invoice WHERE id=? AND business_id=?",
                    originalId, b);
            Map<String, Object> original = originals.getFirst();
            BigDecimal originalTotal = (BigDecimal) original.get("total_incl_tax");
            BigDecimal issuedCredits = repo.value(
                    "SELECT COALESCE(SUM(total_incl_tax),0) FROM invoice " +
                    "WHERE business_id=? AND credited_invoice_id=? AND document_type='CREDIT_NOTE' AND status_id=2",
                    BigDecimal.class, b, originalId);
            int newOriginalStatus = issuedCredits.compareTo(originalTotal) >= 0 ? 4 : 3;
            int previousOriginalStatus = ((Number) original.get("status_id")).intValue();
            repo.update("UPDATE invoice SET status_id=? WHERE id=? AND business_id=?",
                    newOriginalStatus, originalId, b);
            repo.update(
                    "INSERT INTO invoice_status_history(invoice_id,old_status_id,new_status_id,changed_by,reason) VALUES(?,?,?,?,?)",
                    originalId, previousOriginalStatus, newOriginalStatus, user, "CREDIT_NOTE_ISSUED");
            tenant.audit(b, user, "CREDIT_NOTE_ISSUED", "INVOICE", originalId);
        }
        return detail(b, id);
    }

    private Map<String, Object> detail(long b, long id) {
        Map<String, Object> result = invoice(b, id);
        result.put("items", repo.list("SELECT * FROM invoice_item WHERE invoice_id=? ORDER BY line_number", id));
        result.put("statusHistory", repo.list(
                "SELECT h.*,o.code old_status,n.code new_status FROM invoice_status_history h LEFT JOIN invoice_status o ON o.id=h.old_status_id JOIN invoice_status n ON n.id=h.new_status_id WHERE h.invoice_id=? ORDER BY h.changed_at",
                id));
        BigDecimal allocated = repo.value(
                "SELECT COALESCE(SUM(pa.allocated_amount),0) FROM payment_allocation pa JOIN payment p ON p.id=pa.payment_id WHERE pa.invoice_id=? AND p.business_id=?",
                BigDecimal.class, id, b);
        BigDecimal total = (BigDecimal) result.get("total_incl_tax");
        result.put("allocatedAmount", allocated);
        result.put("outstandingAmount", total.subtract(allocated).max(BigDecimal.ZERO));
        return result;
    }

    private Map<String, Object> invoice(long b, long id) {
        List<Map<String, Object>> rows = repo.list(
                "SELECT i.*,s.code status_code,s.name status_name FROM invoice i JOIN invoice_status s ON s.id=i.status_id WHERE i.id=? AND i.business_id=?",
                id, b);
        if (rows.isEmpty())
            throw new ApiException(HttpStatus.NOT_FOUND, "Invoice not found");
        return new HashMap<>(rows.getFirst());
    }

    private Map<String, Object> product(long b, long id) {
        List<Map<String, Object>> rows = repo
                .list("SELECT * FROM product WHERE id=? AND business_id=? AND is_active=TRUE", id, b);
        if (rows.isEmpty())
            throw new ApiException(HttpStatus.NOT_FOUND, "Product not found");
        return rows.getFirst();
    }

    private Map<String, Object> subject(long b, long id, String label) {
        List<Map<String, Object>> rows = repo.list(
                "SELECT * FROM subject WHERE id=? AND business_id=? AND is_active=TRUE", id, b);
        if (rows.isEmpty())
            throw new ApiException(HttpStatus.BAD_REQUEST, label + " subject not found in this business");
        return rows.getFirst();
    }

    private static void set(PreparedStatement p, int i, Object value) throws SQLException {
        if (value == null)
            p.setNull(i, Types.BIGINT);
        else
            p.setObject(i, value);
    }
}
