package com.billbookmanagement.modules.business.service;

import com.billbookmanagement.modules.business.repository.BusinessRepository;
import com.billbookmanagement.shared.service.TenantService;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class BusinessService {
    private final BusinessRepository repo;
    private final TenantService tenant;

    public BusinessService(BusinessRepository repo, TenantService tenant) {
        this.repo = repo;
        this.tenant = tenant;
    }

    public Map<String, Object> create(Long user, String legal, String display, String registration, String currency) {
        long id = repo.create(legal, display, registration, currency);
        repo.addMember(id, user, "OWNER");
        tenant.audit(id, user, "CREATE", "BUSINESS", id);
        return repo.find(id);
    }

    public List<Map<String, Object>> list(Long user) {
        return repo.findForUser(user);
    }

    public Map<String, Object> get(Long user, long id) {
        tenant.requireBusiness(user, id);
        return repo.find(id);
    }

    public void addMember(Long user, long id, long member, String role) {
        tenant.requireBusiness(user, id, "OWNER", "ADMIN");
        repo.addMember(id, member, role);
    }

    public void removeMember(Long user, long id, long member) {
        tenant.requireBusiness(user, id, "OWNER", "ADMIN");
        repo.disableMember(id, member);
    }
}
