package com.project.passport.api.dto;

import com.project.passport.api.enums.MedicalResult;

public class MedicalReviewDto {     

    private MedicalResult medicalResult;
    private String medicalNotes;

    
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

    
    
}
