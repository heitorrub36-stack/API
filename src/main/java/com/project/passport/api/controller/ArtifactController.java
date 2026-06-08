package com.project.passport.api.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.project.passport.api.dto.ArtifactDto;
import com.project.passport.api.dto.ArtifactInvalidation;
import com.project.passport.api.model.Artifact;
import com.project.passport.api.services.ArtifactService;



@RestController
@RequestMapping("/api/artifacts")
public class ArtifactController {

    private final ArtifactService artifactService;

    public ArtifactController(ArtifactService artifactService) {
        this.artifactService = artifactService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Artifact createArtifact(@RequestBody ArtifactDto artifactDto) {
        return artifactService.createArtifact(artifactDto);
    }
     @GetMapping("/passport/{passportId}")
    public List<Artifact> getArtifactsByPassport(@PathVariable UUID passportId) {
        return artifactService.getArtifactsByPassportId(passportId);
    }

    @PatchMapping("/validate/{id}")
    public Artifact validateArtifact(@PathVariable UUID id) {
        return artifactService.validateArtifact(id);
    }

    @PatchMapping("/{id}/invalidate")
    public Artifact invalidateArtifact(@PathVariable UUID id,  @RequestBody ArtifactInvalidation invalidationDto) {
        if (invalidationDto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalidation data is required");
        }
        
        return artifactService.invalidateArtifact(id, invalidationDto.getReason()); 
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteArtifact(@PathVariable UUID id) {
        artifactService.deleteArtifact(id);
    }

    

  

}
