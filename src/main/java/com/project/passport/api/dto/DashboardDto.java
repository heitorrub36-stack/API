package com.project.passport.api.dto;

public class DashboardDto {

    private long totalPassports;
    private long pendingMedicalEvaluation;
    private long fitWaitingManagerDecision;

    private long openPassports;
    private long validPassports;
    private long invalidPassports;
    private long cancelledPassports;

    public DashboardDto(){

    }

    public DashboardDto(long totalPassports, long pendingMedicalEvaluation, long fitWaitingManagerDecision,
            long openPassports, long validPassports, long invalidPassports, long cancelledPassports) {
        this.totalPassports = totalPassports;
        this.pendingMedicalEvaluation = pendingMedicalEvaluation;
        this.fitWaitingManagerDecision = fitWaitingManagerDecision;
        this.openPassports = openPassports;
        this.validPassports = validPassports;
        this.invalidPassports = invalidPassports;
        this.cancelledPassports = cancelledPassports;
    }

    public long getTotalPassports() {
        return totalPassports;
    }

    public void setTotalPassports(long totalPassports) {
        this.totalPassports = totalPassports;
    }

    public long getPendingMedicalEvaluation() {
        return pendingMedicalEvaluation;
    }

    public void setPendingMedicalEvaluation(long pendingMedicalEvaluation) {
        this.pendingMedicalEvaluation = pendingMedicalEvaluation;
    }

    public long getPendingMedicalRvaluation() {
        return pendingMedicalEvaluation;
    }

    public void setPendingMedicalRvaluation(long pendingMedicalRvaluation) {
        this.pendingMedicalEvaluation = pendingMedicalRvaluation;
    }

    public long getFitWaitingManagerDecision() {
        return fitWaitingManagerDecision;
    }

    public void setFitWaitingManagerDecision(long fitWaitingManagerDecision) {
        this.fitWaitingManagerDecision = fitWaitingManagerDecision;
    }

    public long getOpenPassports() {
        return openPassports;
    }

    public void setOpenPassports(long openPassports) {
        this.openPassports = openPassports;
    }

    public long getValidPassports() {
        return validPassports;
    }

    public void setValidPassports(long validPassports) {
        this.validPassports = validPassports;
    }

    public long getInvalidPassports() {
        return invalidPassports;
    }

    public void setInvalidPassports(long invalidPassports) {
        this.invalidPassports = invalidPassports;
    }

    public long getCancelledPassports() {
        return cancelledPassports;
    }

    public void setCancelledPassports(long cancelledPassports) {
        this.cancelledPassports = cancelledPassports;
    }

    
    


    
}
