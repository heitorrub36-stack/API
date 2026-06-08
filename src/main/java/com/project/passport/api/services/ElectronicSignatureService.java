package com.project.passport.api.services;

import com.project.passport.api.dto.ElectronicSignatureDto;
import com.project.passport.api.enums.SignatureTargetType;
import com.project.passport.api.model.AppUser;
import com.project.passport.api.model.ElectronicSignature;
import com.project.passport.api.repository.ArtifactRepository;
import com.project.passport.api.repository.ElectronicSignatureRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ElectronicSignatureService {

    private final ElectronicSignatureRepository electronicSignatureRepository;
    private final AppUserService appUserService;
    private final WorkflowService workflowService;
    private final ArtifactRepository artifactRepository;

    public ElectronicSignatureService(
            ElectronicSignatureRepository electronicSignatureRepository,
            AppUserService appUserService,
            WorkflowService workflowService,
            ArtifactRepository artifactRepository) {
        this.electronicSignatureRepository = electronicSignatureRepository;
        this.appUserService = appUserService;
        this.workflowService = workflowService;
        this.artifactRepository = artifactRepository;
    }

    public ElectronicSignature sign(ElectronicSignatureDto dto) {
        validateDto(dto);
        validateTarget(dto.getTargetType(), dto.getTargetId());

        AppUser signedBy = appUserService.getAppUserById(dto.getSignedByUserId());
        if (!signedBy.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Inactive user cannot sign");
        }

        ElectronicSignature signature = new ElectronicSignature();
        signature.setSignedBy(signedBy);
        signature.setSignedAt(LocalDateTime.now());
        signature.setTargetType(dto.getTargetType());
        signature.setTargetId(dto.getTargetId());
        signature.setToken(generateToken());

        return electronicSignatureRepository.save(signature);
    }

    public ElectronicSignature getSignatureById(UUID id) {
        return electronicSignatureRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Signature not found"));
    }

    public List<ElectronicSignature> getSignaturesByTarget(SignatureTargetType targetType, UUID targetId) {
        validateTarget(targetType, targetId);
        return electronicSignatureRepository.findByTargetTypeAndTargetId(targetType, targetId);
    }

    private void validateDto(ElectronicSignatureDto dto) {
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Signature data is required");
        }
        if (dto.getSignedByUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Signed by user is required");
        }
        if (dto.getTargetType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target type is required");
        }
        if (dto.getTargetId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target id is required");
        }
    }

    private void validateTarget(SignatureTargetType targetType, UUID targetId) {
        if (targetType == null || targetId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target type and target id are required");
        }

        if (targetType == SignatureTargetType.TASK) {
            workflowService.getTaskById(targetId);
            return;
        }

        if (targetType == SignatureTargetType.SUBTASK) {
            workflowService.getSubtaskById(targetId);
            return;
        }

        if (targetType == SignatureTargetType.ARTIFACT) {
            artifactRepository.findById(targetId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artifact not found"));
        }
    }

    private String generateToken() {
        return "SIG-" + UUID.randomUUID();
    }
}
