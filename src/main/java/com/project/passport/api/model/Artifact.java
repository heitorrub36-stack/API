package com.project.passport.api.model;

import com.project.passport.api.enums.ProcessStatus;
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

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "artifact")
public class Artifact {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String documentName;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileType;

    private String notes;

    private LocalDate uploadDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProcessStatus status;

    private String invalidationReason;

    @ManyToOne
    @JoinColumn(name = "activity_id")
    private PassportActivity activity;

    @ManyToOne
    @JoinColumn(name = "task_id")
    private PassportTask task;

    @ManyToOne
    @JoinColumn(name = "subtask_id")
    private PassportSubtask subtask;

    public Artifact() {
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDate getUploadDate() { return uploadDate; }
    public void setUploadDate(LocalDate uploadDate) { this.uploadDate = uploadDate; }
    public ProcessStatus getStatus() { return status; }
    public void setStatus(ProcessStatus status) { this.status = status; }
    public String getInvalidationReason() { return invalidationReason; }
    public void setInvalidationReason(String invalidationReason) { this.invalidationReason = invalidationReason; }
    public PassportActivity getActivity() { return activity; }
    public void setActivity(PassportActivity activity) { this.activity = activity; }
    public PassportTask getTask() { return task; }
    public void setTask(PassportTask task) { this.task = task; }
    public PassportSubtask getSubtask() { return subtask; }
    public void setSubtask(PassportSubtask subtask) { this.subtask = subtask; }
}
