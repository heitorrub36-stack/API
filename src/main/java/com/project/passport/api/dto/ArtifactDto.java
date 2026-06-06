package com.project.passport.api.dto;

import java.util.UUID;

public class ArtifactDto {

    private UUID passportId;
    private String documentName;
    private String fileName;
    private String fileType;
    private String notes;



    public UUID getPassportId() {
        return passportId;
    }
    public void setPassportId(UUID passportId) {
        this.passportId = passportId;
    }
    public String getDocumentName() {
        return documentName;
    }
    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }
    public String getFileName() {
        return fileName;
    }
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    public String getFileType() {
        return fileType;
    }
    public void setFileType(String fileType) {
        this.fileType = fileType;
    }
    public String getNotes() {
        return notes;
    }
    public void setNotes(String notes) {
        this.notes = notes;
    }

    

    



    
}
