package com.project.passport.api.repository;

import com.project.passport.api.model.PassportProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PassportProfileRepository extends JpaRepository<PassportProfile, UUID> {
}
