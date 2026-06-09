package com.project.passport.api.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.passport.api.model.Passport;

public interface PassportRepository extends JpaRepository<Passport, UUID> {

    boolean existsByCandidateAccessKey(String candidateAccessKey);

    Optional<Passport> findByCandidateAccessKey(String candidateAccessKey);
}
