package com.billbookmanagement.modules.dashboard.service;

import com.billbookmanagement.modules.dashboard.repository.DashboardRepository;
import com.billbookmanagement.shared.service.TenantService;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class DashboardService {
    private final DashboardRepository repo;
    private final TenantService tenant;

    public DashboardService(DashboardRepository r, TenantService t) {
        repo = r;
        tenant = t;
    }

    public Map<String, Object> summary(Long user, long business) {
        tenant.requireBusiness(user, business);
        return repo.summary(business);
    }
}
