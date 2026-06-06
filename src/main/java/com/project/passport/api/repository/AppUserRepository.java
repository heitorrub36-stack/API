package com.project.passport.api.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.passport.api.model.AppUser;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {


    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, UUID id);
    
}
