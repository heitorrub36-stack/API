package com.project.passport.api.repository;

import java.util.UUID;

import com.project.passport.api.enums.ManagerDecision;
import com.project.passport.api.enums.MedicalResult;
import com.project.passport.api.enums.PassportStatus;
import com.project.passport.api.model.Passport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PassportRepository extends JpaRepository<Passport, UUID> {

    long countByStatus(PassportStatus status);

    long countByMedicalResult(MedicalResult medicalResult);

    long countByMedicalResultAndManagerDecision( 
        MedicalResult medicalResult,
        ManagerDecision managerDecision

    );

    
    
}
