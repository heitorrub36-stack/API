package com.project.passport.api.services;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.project.passport.api.dto.ArtifactDto;
import com.project.passport.api.enums.WorkflowStatus;
import com.project.passport.api.model.Artifact;
import com.project.passport.api.model.Passport;
import com.project.passport.api.repository.ArtifactRepository;

@Service
public class ArtifactService {

    private final ArtifactRepository artifactRepository;
    private final PassportService passportService;

    public ArtifactService(ArtifactRepository artifactRepository, PassportService passportService) {
        this.artifactRepository = artifactRepository;
        this.passportService = passportService;
    }

    public Artifact createArtifact(ArtifactDto artifactDto) {
        validateArtifactDto(artifactDto);

        Passport passport = passportService.getPassportById(artifactDto.getPassportId());

        Artifact artifact = new Artifact();
        artifact.setPassport(passport);
        artifact.setDocumentName(artifactDto.getDocumentName());
        artifact.setFileName(artifactDto.getFileName());
        artifact.setFileType(artifactDto.getFileType());
        artifact.setNotes(artifactDto.getNotes());
        artifact.setUploadDate(LocalDate.now());
        artifact.setStatus(WorkflowStatus.ABERTA);

        return artifactRepository.save(artifact);
    }

    public List<Artifact> getArtifactsByPassportId(UUID passportId) {
        passportService.getPassportById(passportId);
        return artifactRepository.findByPassportId(passportId);
    }

    public Artifact validateArtifact(UUID id) {
        Artifact artifact = getArtifactById(id);
        artifact.setStatus(WorkflowStatus.VALIDA);
        artifact.setInvalidationReason(null);
        return artifactRepository.save(artifact);
    }

    public Artifact invalidateArtifact(UUID id, String reason) {
        if (isBlank(reason)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalidation reason must be provided");
        }

        Artifact artifact = getArtifactById(id);
        artifact.setStatus(WorkflowStatus.INVALIDA);
        artifact.setInvalidationReason(reason);

        return artifactRepository.save(artifact);
    }

    public Artifact getArtifactById(UUID id) {
        return artifactRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artifact not found"));
    }

    public void validateArtifactDto(ArtifactDto artifactDto) {
        if (artifactDto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Artifact data is required");
        }
        if (artifactDto.getPassportId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passport ID is required");
        }
        if (isBlank(artifactDto.getDocumentName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document name is required");
        }
        if (isBlank(artifactDto.getFileName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File name is required");
        }
        if (isBlank(artifactDto.getFileType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File type is required");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
