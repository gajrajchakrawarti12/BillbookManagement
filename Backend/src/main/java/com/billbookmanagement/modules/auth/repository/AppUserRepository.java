package com.billbookmanagement.modules.auth.repository;

import com.billbookmanagement.modules.auth.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    boolean existsByEmail(String email);
    Optional<AppUser> findByEmailAndActiveTrue(String email);
    Optional<AppUser> findByIdAndActiveTrue(Long id);
}
