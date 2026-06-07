package com.project.passport.api.repository;

import com.project.passport.api.model.PassportActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PassportActivityRepository extends JpaRepository<PassportActivity, UUID> {
    List<PassportActivity> findByPassportIdOrderByOrderNumberAsc(UUID passportId);
}
