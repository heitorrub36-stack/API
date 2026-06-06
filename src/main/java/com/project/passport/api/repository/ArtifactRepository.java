package com.project.passport.api.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.passport.api.model.Artifact;

public interface ArtifactRepository extends JpaRepository<Artifact, UUID> {

    List<Artifact> findByPassportId(UUID passportId);
    
}
