package com.project.passport.api.dto;

public class DashboardDto {

    private long totalPassports;
    private long pendingMedicalEvaluation;
    private long fitWaitingManagerStatus;

    private long openPassports;
    private long validPassports;
    private long invalidPassports;
    private long canceledPassports;

    public DashboardDto() {
    }

    public DashboardDto(long totalPassports, long pendingMedicalEvaluation, long fitWaitingManagerStatus,
            long openPassports, long validPassports, long invalidPassports, long canceledPassports) {
        this.totalPassports = totalPassports;
        this.pendingMedicalEvaluation = pendingMedicalEvaluation;
        this.fitWaitingManagerStatus = fitWaitingManagerStatus;
        this.openPassports = openPassports;
        this.validPassports = validPassports;
        this.invalidPassports = invalidPassports;
        this.canceledPassports = canceledPassports;
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

    public long getFitWaitingManagerStatus() {
        return fitWaitingManagerStatus;
    }

    public void setFitWaitingManagerStatus(long fitWaitingManagerStatus) {
        this.fitWaitingManagerStatus = fitWaitingManagerStatus;
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

    public long getCanceledPassports() {
        return canceledPassports;
    }

    public void setCanceledPassports(long canceledPassports) {
        this.canceledPassports = canceledPassports;
    }
}
