package com.project.passport.api.dto;

import java.util.UUID;

import com.project.passport.api.enums.ManagerStatus;

public class ManagerReviewDto {

    private ManagerStatus managerStatus;

    private String managerNotes;

    private UUID managerReviewerId;

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

    public UUID getManagerReviewerId() {
        return managerReviewerId;
    }

    public void setManagerReviewerId(UUID managerReviewerId) {
        this.managerReviewerId = managerReviewerId;
    }

    
}
