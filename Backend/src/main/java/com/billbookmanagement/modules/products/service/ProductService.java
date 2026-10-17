package com.billbookmanagement.modules.products.service;

import com.billbookmanagement.modules.products.repository.ProductRepository;
import com.billbookmanagement.shared.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ProductService {
    private final ProductRepository repo;
    private final TenantService tenant;

    public ProductService(ProductRepository r, TenantService t) {
        repo = r;
        tenant = t;
    }

    private Map<String, Object> required(long b, long id) {
        Map<String, Object> x = repo.one(b, id);
        if (x == null)
            throw new ApiException(HttpStatus.NOT_FOUND, "Product not found");
        return x;
    }

    public List<Map<String, Object>> list(long u, long b) {
        tenant.requireBusiness(u, b);
        return repo.list(b);
    }

    public Map<String, Object> get(long u, long b, long id) {
        tenant.requireBusiness(u, b);
        return required(b, id);
    }

    public Map<String, Object> create(long u, long b, Object... v) {
        tenant.requireBusiness(u, b, "OWNER", "ADMIN", "ACCOUNTANT", "STAFF");
        repo.create(b, v);
        long id = repo.id();
        tenant.audit(b, u, "CREATE", "PRODUCT", id);
        return required(b, id);
    }

    public Map<String, Object> update(long u, long b, long id, Object... v) {
        tenant.requireBusiness(u, b, "OWNER", "ADMIN", "ACCOUNTANT", "STAFF");
        if (repo.update(b, id, v) == 0)
            throw new ApiException(HttpStatus.NOT_FOUND, "Product not found");
        tenant.audit(b, u, "UPDATE", "PRODUCT", id);
        return required(b, id);
    }

    public Map<String, Object> active(long b, long id) {
        Map<String, Object> x = repo.active(b, id);
        if (x == null)
            throw new ApiException(HttpStatus.NOT_FOUND, "Product not found");
        return x;
    }
}
