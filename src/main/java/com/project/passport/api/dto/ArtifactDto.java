package com.project.passport.api.dto;

import java.util.UUID;

public class ArtifactDto {

    private UUID passportId;
    private UUID activityId;
    private UUID taskId;
    private UUID subtaskId;
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
    public UUID getActivityId() {
        return activityId;
    }
    public void setActivityId(UUID activityId) {
        this.activityId = activityId;
    }
    public UUID getTaskId() {
        return taskId;
    }
    public void setTaskId(UUID taskId) {
        this.taskId = taskId;
    }
    public UUID getSubtaskId() {
        return subtaskId;
    }
    public void setSubtaskId(UUID subtaskId) {
        this.subtaskId = subtaskId;
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
