package com.billbookmanagement.modules.dashboard;

import com.billbookmanagement.modules.dashboard.service.DashboardService;
import com.billbookmanagement.shared.service.TenantService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/businesses/{businessId}/dashboard")
public class DashboardController {
    private final DashboardService service;
    private final TenantService tenant;

    public DashboardController(DashboardService s, TenantService t) {
        service = s;
        tenant = t;
    }

    @GetMapping
    Map<String, Object> summary(@PathVariable Long businessId, Authentication a) {
        return service.summary(tenant.userId(a), businessId);
    }
}
