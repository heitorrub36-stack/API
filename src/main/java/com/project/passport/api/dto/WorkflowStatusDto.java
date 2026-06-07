package com.project.passport.api.dto;

import com.project.passport.api.enums.WorkflowStatus;

public class WorkflowStatusDto {

    private WorkflowStatus status;

    public WorkflowStatus getStatus() { return status; }
    public void setStatus(WorkflowStatus status) { this.status = status; }
}
