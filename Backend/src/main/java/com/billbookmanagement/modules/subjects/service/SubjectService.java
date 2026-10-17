package com.billbookmanagement.modules.subjects.service;

import com.billbookmanagement.modules.subjects.repository.SubjectRepository;
import com.billbookmanagement.shared.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class SubjectService {
    private final SubjectRepository repo;
    private final TenantService tenant;

    public SubjectService(SubjectRepository r, TenantService t) {
        repo = r;
        tenant = t;
    }

    public List<Map<String, Object>> list(long u, long b, boolean a) {
        tenant.requireBusiness(u, b);
        return repo.list(b, a);
    }

    public Map<String, Object> get(long u, long b, long id) {
        tenant.requireBusiness(u, b);
        return required(b, id);
    }

    public Map<String, Object> create(long u, long b, String type, String name, String tax, String vat, String reg,
            String email, String phone) {
        tenant.requireBusiness(u, b, "OWNER", "ADMIN", "ACCOUNTANT", "STAFF");
        repo.create(b, type, name, tax, vat, reg, email, phone);
        long id = repo.lastId();
        tenant.audit(b, u, "CREATE", "SUBJECT", id);
        return required(b, id);
    }

    public Map<String, Object> update(long u, long b, long id, String type, String name, String tax, String vat,
            String reg, String email, String phone) {
        tenant.requireBusiness(u, b, "OWNER", "ADMIN", "ACCOUNTANT", "STAFF");
        if (repo.update(b, id, type, name, tax, vat, reg, email, phone) == 0)
            throw new ApiException(HttpStatus.NOT_FOUND, "Subject not found");
        tenant.audit(b, u, "UPDATE", "SUBJECT", id);
        return required(b, id);
    }

    public void delete(long u, long b, long id) {
        tenant.requireBusiness(u, b, "OWNER", "ADMIN");
        repo.deactivate(b, id);
        tenant.audit(b, u, "DEACTIVATE", "SUBJECT", id);
    }

    public Map<String, Object> required(long b, long id) {
        Map<String, Object> x = repo.one(b, id);
        if (x == null)
            throw new ApiException(HttpStatus.NOT_FOUND, "Subject not found");
        return x;
    }
}
