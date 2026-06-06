package com.project.passport.api.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.passport.api.enums.ManagerStatus;
import com.project.passport.api.enums.MedicalStatus;
import com.project.passport.api.enums.WorkflowStatus;
import com.project.passport.api.model.Passport;

public interface PassportRepository extends JpaRepository<Passport, UUID> {

    long countByStatus(WorkflowStatus status);

    long countByMedicalStatus(MedicalStatus medicalStatus);

    long countByMedicalStatusAndManagerStatus(
            MedicalStatus medicalStatus,
            ManagerStatus managerStatus
    );
}
