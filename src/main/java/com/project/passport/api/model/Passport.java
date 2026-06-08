package com.project.passport.api.model;

import com.project.passport.api.enums.ManagerStatus;
import com.project.passport.api.enums.MedicalStatus;
import com.project.passport.api.enums.ProcessStatus;
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

import java.time.LocalDate;
import java.util.UUID;

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

    @Column(unique = true)
    private String candidateAccessKey;

    @Column(nullable = false)
    private LocalDate createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProcessStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MedicalStatus medicalStatus;

    private String medicalNotes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ManagerStatus managerStatus;

    private String managerNotes;

    @ManyToOne
    @JoinColumn(name = "profile_id")
    private PassportProfile profile;

    @ManyToOne
    @JoinColumn(name = "created_by_rh_id")
    private AppUser createdByRh;

    @ManyToOne
    @JoinColumn(name = "medical_reviewer_id")
    private AppUser medicalReviewer;

    @ManyToOne
    @JoinColumn(name = "manager_reviewer_id")
    private AppUser managerReviewer;

    public Passport() {
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }
    public String getCandidateCpf() { return candidateCpf; }
    public void setCandidateCpf(String candidateCpf) { this.candidateCpf = candidateCpf; }
    public String getJobPosition() { return jobPosition; }
    public void setJobPosition(String jobPosition) { this.jobPosition = jobPosition; }
    public String getCandidateAccessKey() { return candidateAccessKey; }
    public void setCandidateAccessKey(String candidateAccessKey) { this.candidateAccessKey = candidateAccessKey; }
    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
    public ProcessStatus getStatus() { return status; }
    public void setStatus(ProcessStatus status) { this.status = status; }
    public MedicalStatus getMedicalStatus() { return medicalStatus; }
    public void setMedicalStatus(MedicalStatus medicalStatus) { this.medicalStatus = medicalStatus; }
    public String getMedicalNotes() { return medicalNotes; }
    public void setMedicalNotes(String medicalNotes) { this.medicalNotes = medicalNotes; }
    public ManagerStatus getManagerStatus() { return managerStatus; }
    public void setManagerStatus(ManagerStatus managerStatus) { this.managerStatus = managerStatus; }
    public String getManagerNotes() { return managerNotes; }
    public void setManagerNotes(String managerNotes) { this.managerNotes = managerNotes; }
    public PassportProfile getProfile() { return profile; }
    public void setProfile(PassportProfile profile) { this.profile = profile; }
    public AppUser getCreatedByRh() { return createdByRh; }
    public void setCreatedByRh(AppUser createdByRh) { this.createdByRh = createdByRh; }
    public AppUser getMedicalReviewer() { return medicalReviewer; }
    public void setMedicalReviewer(AppUser medicalReviewer) { this.medicalReviewer = medicalReviewer; }
    public AppUser getManagerReviewer() { return managerReviewer; }
    public void setManagerReviewer(AppUser managerReviewer) { this.managerReviewer = managerReviewer; }
}
