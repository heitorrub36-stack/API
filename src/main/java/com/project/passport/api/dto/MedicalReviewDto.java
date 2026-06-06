package com.project.passport.api.dto;

import java.util.UUID;

import com.project.passport.api.enums.MedicalStatus;

public class MedicalReviewDto {

    private MedicalStatus medicalStatus;

    private String medicalNotes;

    private UUID medicalReviewerId;

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

    public UUID getMedicalReviewerId() {
        return medicalReviewerId;
    }

    public void setMedicalReviewerId(UUID medicalReviewerId) {
        this.medicalReviewerId = medicalReviewerId;
    }

    
}
