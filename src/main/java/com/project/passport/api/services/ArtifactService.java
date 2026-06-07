package com.project.passport.api.services;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.project.passport.api.dto.ArtifactDto;
import com.project.passport.api.enums.WorkflowStatus;
import com.project.passport.api.model.Artifact;
import com.project.passport.api.model.PassportTask;
import com.project.passport.api.model.PassportSubtask;
import com.project.passport.api.repository.ArtifactRepository;

@Service
public class ArtifactService {

    private final ArtifactRepository artifactRepository;
    private final WorkflowService workflowService;

    public ArtifactService(ArtifactRepository artifactRepository, WorkflowService workflowService) {
        this.artifactRepository = artifactRepository;
        this.workflowService = workflowService;
    }

    public Artifact createArtifact(ArtifactDto artifactDto) {
        validateArtifactDto(artifactDto);

        Artifact artifact = new Artifact();
        artifact.setDocumentName(artifactDto.getDocumentName());
        artifact.setFileName(artifactDto.getFileName());
        artifact.setFileType(artifactDto.getFileType());
        artifact.setNotes(artifactDto.getNotes());
        artifact.setUploadDate(LocalDate.now());
        artifact.setStatus(WorkflowStatus.ABERTA);

        if (artifactDto.getTaskId() != null) {
            PassportTask task = workflowService.getTaskById(artifactDto.getTaskId());
            artifact.setTask(task);
        } else if (artifactDto.getSubtaskId() != null) {
            PassportSubtask subtask = workflowService.getSubtaskById(artifactDto.getSubtaskId());
            artifact.setSubtask(subtask);
        } else if (artifactDto.getPassportId() != null) {
            // Compatibilidade com a tela atual: se só vier passportId, vincula ao primeiro task do workflow padrão.
            PassportTask firstTask = workflowService.findFirstTaskByPassport(artifactDto.getPassportId());
            artifact.setTask(firstTask);
        }

        return artifactRepository.save(artifact);
    }

    public List<Artifact> getArtifactsByPassportId(UUID passportId) {
        List<Artifact> artifacts = new ArrayList<>();
        artifacts.addAll(artifactRepository.findByTaskActivityPassportId(passportId));
        artifacts.addAll(artifactRepository.findBySubtaskTaskActivityPassportId(passportId));
        return artifacts;
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
        if (artifactDto.getPassportId() == null && artifactDto.getTaskId() == null && artifactDto.getSubtaskId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Artifact must be linked to a passport, task or subtask");
        }
        if (artifactDto.getTaskId() != null && artifactDto.getSubtaskId() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Artifact must be linked to only one target: task or subtask");
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
