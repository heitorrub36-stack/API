package com.project.passport.api.dto;

import com.project.passport.api.enums.ManagerDecision;

public class ManagerReviewDto {

    private ManagerDecision managerDecision;
    private String managerNotes;
    
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
