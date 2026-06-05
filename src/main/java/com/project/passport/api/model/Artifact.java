package com.project.passport.api.model;

import java.time.LocalDate;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.project.passport.api.enums.ArtifactsStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "artifact")  
public class Artifact {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String doucumentName;
    
    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileType;

    
    private String notes;

    private LocalDate uploadDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ArtifactsStatus status;


    private String invalidationReason;

   
    @ManyToOne
    @JoinColumn(name = "passport_id", nullable = false)
    private Passport passport;



    public Artifact() {
    }



    public UUID getId() {
        return id;
    }



    public void setId(UUID id) {
        this.id = id;
    }



    public String getDoucumentName() {
        return doucumentName;
    }



    public void setDoucumentName(String doucumentName) {
        this.doucumentName = doucumentName;
    }



    public String getFileName() {
        return fileName;
    }



    public void setFileName(String fileName) {
        this.fileName = fileName;
    }



    public String getFileType() {
        return fileType;
    }



    public void setFileType(String fileType) {
        this.fileType = fileType;
    }



    public String getNotes() {
        return notes;
    }



    public void setNotes(String notes) {
        this.notes = notes;
    }



    public LocalDate getUploadDate() {
        return uploadDate;
    }



    public void setUploadDate(LocalDate uploadDate) {
        this.uploadDate = uploadDate;
    }



    public ArtifactsStatus getStatus() {
        return status;
    }



    public void setStatus(ArtifactsStatus status) {
        this.status = status;
    }



    public String getInvalidationReason() {
        return invalidationReason;
    }



    public void setInvalidationReason(String invalidationReason) {
        this.invalidationReason = invalidationReason;
    }



    public Passport getPassport() {
        return passport;
    }



    public void setPassport(Passport passport) {
        this.passport = passport;
    }

    


}
