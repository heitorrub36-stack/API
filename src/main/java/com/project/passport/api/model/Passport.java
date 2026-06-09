package com.project.passport.api.model;

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
    private WorkflowStatus status;

    @ManyToOne
    @JoinColumn(name = "profile_id")
    private PassportProfile profile;

    @ManyToOne
    @JoinColumn(name = "created_by_rh_id")
    private AppUser createdByRh;

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
    public WorkflowStatus getStatus() { return status; }
    public void setStatus(WorkflowStatus status) { this.status = status; }
    public PassportProfile getProfile() { return profile; }
    public void setProfile(PassportProfile profile) { this.profile = profile; }
    public AppUser getCreatedByRh() { return createdByRh; }
    public void setCreatedByRh(AppUser createdByRh) { this.createdByRh = createdByRh; }
}
