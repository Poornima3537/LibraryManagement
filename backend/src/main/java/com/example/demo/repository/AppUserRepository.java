package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.AppUser;
import com.example.demo.entity.UserRole;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    boolean existsByEmailIgnoreCase(String email);

    boolean existsByRole(UserRole role);

    Optional<AppUser> findByEmailIgnoreCase(String email);
}
