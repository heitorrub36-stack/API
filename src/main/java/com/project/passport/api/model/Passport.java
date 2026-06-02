package com.project.passport.api.model;

import java.time.LocalDate;
import java.util.UUID;

import com.project.passport.api.enums.ManagerDecision;
import com.project.passport.api.enums.MedicalResult;
import com.project.passport.api.enums.PassportStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "passports")
public class Passport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String candidateName;

    @Column(nullable = false)
    private String canditeCpf;

    @Column(nullable = false)
    private String jobPosition;

    @Column(nullable = false)
    private LocalDate createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PassportStatus status;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MedicalResult medicalResult;

    private String medicalNotes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ManagerDecision managerDecision;

    private String managerNotes;

    public Passport() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public String getCanditeCpf() {
        return canditeCpf;
    }

    public void setCanditeCpf(String canditeCpf) {
        this.canditeCpf = canditeCpf;
    }

    public String getJobPosition() {
        return jobPosition;
    }

    public void setJobPosition(String jobPosition) {
        this.jobPosition = jobPosition;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }

    public PassportStatus getStatus() {
        return status;
    }

    public void setStatus(PassportStatus status) {
        this.status = status;
    }

    public MedicalResult getMedicalResult() {
        return medicalResult;
    }

    public void setMedicalResult(MedicalResult medicalResult) {
        this.medicalResult = medicalResult;
    }

    public String getMedicalNotes() {
        return medicalNotes;
    }

    public void setMedicalNotes(String medicalNotes) {
        this.medicalNotes = medicalNotes;
    }

    public ManagerDecision getManagerDecision() {
        return managerDecision;
    }

    public void setManagerDecision(ManagerDecision managerDecision) {
        this.managerDecision = managerDecision;
    }

    public String getManagerNotes() {
        return managerNotes;
    }

    public void setManagerNotes(String managerNotes) {
        this.managerNotes = managerNotes;
    }

    
}
