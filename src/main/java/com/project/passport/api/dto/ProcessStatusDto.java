package com.project.passport.api.dto;

import com.project.passport.api.enums.ProcessStatus;

public class ProcessStatusDto {

    private ProcessStatus status;

    public ProcessStatus getStatus() { return status; }
    public void setStatus(ProcessStatus status) { this.status = status; }
}
