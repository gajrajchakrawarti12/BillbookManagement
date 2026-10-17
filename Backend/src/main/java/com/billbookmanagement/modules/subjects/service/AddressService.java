package com.billbookmanagement.modules.subjects.service;

import com.billbookmanagement.modules.subjects.repository.AddressRepository;
import com.billbookmanagement.shared.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;

@Service
public class AddressService {
    private final AddressRepository repo;
    private final SubjectService subjects;
    private final TenantService tenant;

    public AddressService(AddressRepository r, SubjectService s, TenantService t) {
        repo = r;
        subjects = s;
        tenant = t;
    }

    public List<Map<String, Object>> list(long u, long b, long s) {
        tenant.requireBusiness(u, b);
        subjects.required(b, s);
        return repo.list(s);
    }

    public Map<String, Object> create(long u, long b, long s, String l1, String l2, String street, String city,
            String region, String postal, String country, String type, Boolean def, LocalDate from, LocalDate to) {
        tenant.requireBusiness(u, b, "OWNER", "ADMIN", "ACCOUNTANT", "STAFF");
        subjects.required(b, s);
        if (to != null && from != null && to.isBefore(from))
            throw new ApiException(HttpStatus.BAD_REQUEST, "validTo cannot precede validFrom");
        repo.address(l1, l2, street, city, region, postal, country);
        long id = repo.id();
        repo.link(s, id, type == null ? "BILLING" : type, def != null && def, from, to);
        tenant.audit(b, u, "CREATE", "ADDRESS", id);
        return repo.one(id);
    }

    public void delete(long u, long b, long s, long id) {
        tenant.requireBusiness(u, b, "OWNER", "ADMIN", "ACCOUNTANT", "STAFF");
        subjects.required(b, s);
        repo.delete(s, id);
        tenant.audit(b, u, "DELETE", "ADDRESS", id);
    }
}
