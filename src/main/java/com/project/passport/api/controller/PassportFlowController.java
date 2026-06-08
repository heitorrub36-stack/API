package com.project.passport.api.controller;

import com.project.passport.api.dto.PassportActivityDto;
import com.project.passport.api.dto.PassportSubtaskDto;
import com.project.passport.api.dto.PassportTaskDto;
import com.project.passport.api.dto.ProcessStatusDto;
import com.project.passport.api.model.Passport;
import com.project.passport.api.model.PassportActivity;
import com.project.passport.api.model.PassportSubtask;
import com.project.passport.api.model.PassportTask;
import com.project.passport.api.services.PassportService;
import com.project.passport.api.services.PassportFlowService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/passport-flow")
public class PassportFlowController {

    private final PassportFlowService passportFlowService;
    private final PassportService passportService;

    public PassportFlowController(PassportFlowService passportFlowService, PassportService passportService) {
        this.passportFlowService = passportFlowService;
        this.passportService = passportService;
    }

    @PostMapping("/passports/{passportId}/activities")
    @ResponseStatus(HttpStatus.CREATED)
    public PassportActivity createActivity(@PathVariable UUID passportId, @RequestBody PassportActivityDto dto) {
        Passport passport = passportService.getPassportById(passportId);
        return passportFlowService.createActivity(passport, dto);
    }

    @GetMapping("/passports/{passportId}/activities")
    public List<PassportActivity> getActivitiesByPassport(@PathVariable UUID passportId) {
        passportService.getPassportById(passportId);
        return passportFlowService.getActivitiesByPassport(passportId);
    }

    @PostMapping("/activities/{activityId}/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public PassportTask createTask(@PathVariable UUID activityId, @RequestBody PassportTaskDto dto) {
        return passportFlowService.createTask(activityId, dto);
    }

    @GetMapping("/activities/{activityId}/tasks")
    public List<PassportTask> getTasksByActivity(@PathVariable UUID activityId) {
        return passportFlowService.getTasksByActivity(activityId);
    }

    @PostMapping("/tasks/{taskId}/subtasks")
    @ResponseStatus(HttpStatus.CREATED)
    public PassportSubtask createSubtask(@PathVariable UUID taskId, @RequestBody PassportSubtaskDto dto) {
        return passportFlowService.createSubtask(taskId, dto);
    }

    @GetMapping("/tasks/{taskId}/subtasks")
    public List<PassportSubtask> getSubtasksByTask(@PathVariable UUID taskId) {
        return passportFlowService.getSubtasksByTask(taskId);
    }

    @PatchMapping("/activities/{id}/status")
    public PassportActivity updateActivityStatus(@PathVariable UUID id, @RequestBody ProcessStatusDto dto) {
        return passportFlowService.updateActivityStatus(id, dto.getStatus());
    }

    @PatchMapping("/tasks/{id}/status")
    public PassportTask updateTaskStatus(@PathVariable UUID id, @RequestBody ProcessStatusDto dto) {
        return passportFlowService.updateTaskStatus(id, dto.getStatus());
    }

    @PatchMapping("/subtasks/{id}/status")
    public PassportSubtask updateSubtaskStatus(@PathVariable UUID id, @RequestBody ProcessStatusDto dto) {
        return passportFlowService.updateSubtaskStatus(id, dto.getStatus());
    }
}
