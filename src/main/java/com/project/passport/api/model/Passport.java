package com.project.passport.api.model;

import java.time.LocalDate;
import java.util.UUID;

import com.project.passport.api.enums.ManagerStatus;
import com.project.passport.api.enums.MedicalStatus;
import com.project.passport.api.enums.WorkflowStatus;

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
import jakarta.persistence.Version;

@Entity
@Table(name = "passports")
public class Passport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Version
    private Long version;

    @Column(nullable = false)
    private String candidateName;

    @Column(nullable = false)
    private String candidateCpf;

    @Column(nullable = false)
    private String jobPosition;

    @Column(nullable = false)
    private LocalDate createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkflowStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MedicalStatus medicalStatus;

    private String medicalNotes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ManagerStatus managerStatus;

    private String managerNotes;

    @ManyToOne
    @JoinColumn(name = "created_by_rh")
    private AppUser createdByRh;
   
    @ManyToOne
    @JoinColumn(name = "medical_reviewer_id")
    private AppUser medicalReviwer;
     
    @ManyToOne
    @JoinColumn(name = "manager_reviewer_id")
    private AppUser managerReviewer;

    public Passport() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public String getCandidateCpf() {
        return candidateCpf;
    }

    public void setCandidateCpf(String candidateCpf) {
        this.candidateCpf = candidateCpf;
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

    public WorkflowStatus getStatus() {
        return status;
    }

    public void setStatus(WorkflowStatus status) {
        this.status = status;
    }

    public MedicalStatus getMedicalStatus() {
        return medicalStatus;
    }

    public void setMedicalStatus(MedicalStatus medicalStatus) {
        this.medicalStatus = medicalStatus;
    }

    public String getMedicalNotes() {
        return medicalNotes;
    }

    public void setMedicalNotes(String medicalNotes) {
        this.medicalNotes = medicalNotes;
    }

    public ManagerStatus getManagerStatus() {
        return managerStatus;
    }

    public void setManagerStatus(ManagerStatus managerStatus) {
        this.managerStatus = managerStatus;
    }

    public String getManagerNotes() {
        return managerNotes;
    }

    public void setManagerNotes(String managerNotes) {
        this.managerNotes = managerNotes;
    }

    public AppUser getCreatedByRh() {
        return createdByRh;
    }

    public void setCreatedByRh(AppUser createdByRh) {
        this.createdByRh = createdByRh;
    }

    public AppUser getMedicalReviwer() {
        return medicalReviwer;
    }

    public void setMedicalReviwer(AppUser medicalReviwer) {
        this.medicalReviwer = medicalReviwer;
    }

    public AppUser getManagerReviewer() {
        return managerReviewer;
    }

    public void setManagerReviewer(AppUser managerReviewer) {
        this.managerReviewer = managerReviewer;
    }


    
}
