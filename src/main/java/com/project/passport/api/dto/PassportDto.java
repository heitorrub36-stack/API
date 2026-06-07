package com.project.passport.api.dto;

import java.util.UUID;

public class PassportDto {


    private String candidateName;

    private String candidateCpf;

    private String jobPosition;

    private UUID createdByRh;

    private UUID profileId;

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

    public UUID getCreatedByRh() {
        return createdByRh;
    }

    public UUID getProfileId() {
        return profileId;
    }

    public void setCreatedByRh(UUID createdByRh) {
        this.createdByRh = createdByRh;
    }

    public void setProfileId(UUID profileId) {
        this.profileId = profileId;
    }



    
}
