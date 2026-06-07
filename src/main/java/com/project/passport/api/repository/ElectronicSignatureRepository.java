package com.project.passport.api.repository;

import com.project.passport.api.enums.SignatureTargetType;
import com.project.passport.api.model.ElectronicSignature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ElectronicSignatureRepository extends JpaRepository<ElectronicSignature, UUID> {
    List<ElectronicSignature> findByTargetTypeAndTargetId(SignatureTargetType targetType, UUID targetId);
}
