package com.project.passport.api.services;

import com.project.passport.api.dto.PassportActivityDto;
import com.project.passport.api.dto.PassportSubtaskDto;
import com.project.passport.api.dto.PassportTaskDto;
import com.project.passport.api.enums.UserRole;
import com.project.passport.api.enums.WorkflowStatus;
import com.project.passport.api.model.Passport;
import com.project.passport.api.model.PassportActivity;
import com.project.passport.api.model.PassportSubtask;
import com.project.passport.api.model.PassportTask;
import com.project.passport.api.repository.PassportActivityRepository;
import com.project.passport.api.repository.PassportSubtaskRepository;
import com.project.passport.api.repository.PassportTaskRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class WorkflowService {

    private final PassportActivityRepository activityRepository;
    private final PassportTaskRepository taskRepository;
    private final PassportSubtaskRepository subtaskRepository;

    public WorkflowService(
            PassportActivityRepository activityRepository,
            PassportTaskRepository taskRepository,
            PassportSubtaskRepository subtaskRepository
    ) {
        this.activityRepository = activityRepository;
        this.taskRepository = taskRepository;
        this.subtaskRepository = subtaskRepository;
    }

    public void generateDefaultWorkflow(Passport passport) {
        if (passport == null || passport.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passport must be saved before workflow generation");
        }

        PassportActivity documentation = createActivityEntity(
                passport,
                "Cadastro e Documentação",
                "Envio e conferência dos documentos iniciais do candidato.",
                1,
                UserRole.RH
        );
        PassportTask documentsTask = createTaskEntity(
                documentation,
                "Anexar documentos pessoais",
                "Tarefa para anexar RG, CPF, CNH e demais documentos exigidos.",
                1,
                LocalDate.now().plusDays(7),
                UserRole.CONTRATADO
        );
        createSubtaskEntity(documentsTask, "Enviar RG", "Anexar documento de identidade.", 1, LocalDate.now().plusDays(7), UserRole.CONTRATADO);
        createSubtaskEntity(documentsTask, "Enviar CPF", "Anexar CPF do candidato.", 2, LocalDate.now().plusDays(7), UserRole.CONTRATADO);
        createSubtaskEntity(documentsTask, "Enviar CNH", "Anexar CNH quando exigido pelo cargo.", 3, LocalDate.now().plusDays(7), UserRole.CONTRATADO);

        PassportActivity medical = createActivityEntity(
                passport,
                "Avaliação Médica",
                "Registro do resultado médico e conferência dos documentos de saúde.",
                2,
                UserRole.MEDICINA_TRABALHO
        );
        PassportTask medicalTask = createTaskEntity(
                medical,
                "Realizar avaliação médica",
                "Tarefa executada pela Medicina do Trabalho.",
                1,
                LocalDate.now().plusDays(10),
                UserRole.MEDICINA_TRABALHO
        );
        createSubtaskEntity(medicalTask, "Registrar resultado médico", "Informar se o candidato está APTO ou INAPTO.", 1, LocalDate.now().plusDays(10), UserRole.MEDICINA_TRABALHO);

        PassportActivity manager = createActivityEntity(
                passport,
                "Decisão Gerencial",
                "Análise final do gerente responsável pela contratação.",
                3,
                UserRole.GERENTE
        );
        PassportTask managerTask = createTaskEntity(
                manager,
                "Registrar decisão final",
                "Aprovar ou reprovar o candidato para admissão.",
                1,
                LocalDate.now().plusDays(12),
                UserRole.GERENTE
        );
        createSubtaskEntity(managerTask, "Aprovar ou reprovar candidato", "Registrar decisão gerencial final.", 1, LocalDate.now().plusDays(12), UserRole.GERENTE);
    }

    public PassportActivity createActivity(Passport passport, PassportActivityDto dto) {
        validateActivityDto(dto);
        return createActivityEntity(passport, dto.getName(), dto.getDescription(), dto.getOrderNumber(), dto.getResponsibleRole());
    }

    public PassportTask createTask(UUID activityId, PassportTaskDto dto) {
        validateTaskDto(dto);
        PassportActivity activity = getActivityById(activityId);
        return createTaskEntity(activity, dto.getName(), dto.getDescription(), dto.getOrderNumber(), dto.getDeadline(), dto.getResponsibleRole());
    }

    public PassportSubtask createSubtask(UUID taskId, PassportSubtaskDto dto) {
        validateSubtaskDto(dto);
        PassportTask task = getTaskById(taskId);
        return createSubtaskEntity(task, dto.getName(), dto.getDescription(), dto.getOrderNumber(), dto.getDeadline(), dto.getResponsibleRole());
    }

    public List<PassportActivity> getActivitiesByPassport(UUID passportId) {
        return activityRepository.findByPassportIdOrderByOrderNumberAsc(passportId);
    }

    public List<PassportTask> getTasksByActivity(UUID activityId) {
        return taskRepository.findByActivityIdOrderByOrderNumberAsc(activityId);
    }

    public List<PassportSubtask> getSubtasksByTask(UUID taskId) {
        return subtaskRepository.findByTaskIdOrderByOrderNumberAsc(taskId);
    }

    public PassportActivity getActivityById(UUID id) {
        return activityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found"));
    }

    public PassportTask getTaskById(UUID id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    }

    public PassportSubtask getSubtaskById(UUID id) {
        return subtaskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subtask not found"));
    }

    public PassportActivity updateActivityStatus(UUID id, WorkflowStatus status) {
        if (status == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        PassportActivity activity = getActivityById(id);
        activity.setStatus(status);
        return activityRepository.save(activity);
    }

    public PassportTask updateTaskStatus(UUID id, WorkflowStatus status) {
        if (status == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        PassportTask task = getTaskById(id);
        task.setStatus(status);
        return taskRepository.save(task);
    }

    public PassportSubtask updateSubtaskStatus(UUID id, WorkflowStatus status) {
        if (status == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        PassportSubtask subtask = getSubtaskById(id);
        subtask.setStatus(status);
        return subtaskRepository.save(subtask);
    }

    public PassportTask findFirstTaskByPassport(UUID passportId) {
        return taskRepository.findByActivityPassportId(passportId).stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No task found for this passport"));
    }

    private PassportActivity createActivityEntity(Passport passport, String name, String description, Integer orderNumber, UserRole responsibleRole) {
        PassportActivity activity = new PassportActivity();
        activity.setPassport(passport);
        activity.setName(name);
        activity.setDescription(description);
        activity.setOrderNumber(orderNumber != null ? orderNumber : 1);
        activity.setResponsibleRole(responsibleRole);
        activity.setStatus(WorkflowStatus.ABERTA);
        return activityRepository.save(activity);
    }

    private PassportTask createTaskEntity(PassportActivity activity, String name, String description, Integer orderNumber, LocalDate deadline, UserRole responsibleRole) {
        PassportTask task = new PassportTask();
        task.setActivity(activity);
        task.setName(name);
        task.setDescription(description);
        task.setOrderNumber(orderNumber != null ? orderNumber : 1);
        task.setDeadline(deadline);
        task.setResponsibleRole(responsibleRole);
        task.setStatus(WorkflowStatus.ABERTA);
        return taskRepository.save(task);
    }

    private PassportSubtask createSubtaskEntity(PassportTask task, String name, String description, Integer orderNumber, LocalDate deadline, UserRole responsibleRole) {
        PassportSubtask subtask = new PassportSubtask();
        subtask.setTask(task);
        subtask.setName(name);
        subtask.setDescription(description);
        subtask.setOrderNumber(orderNumber != null ? orderNumber : 1);
        subtask.setDeadline(deadline);
        subtask.setResponsibleRole(responsibleRole);
        subtask.setStatus(WorkflowStatus.ABERTA);
        return subtaskRepository.save(subtask);
    }

    private void validateActivityDto(PassportActivityDto dto) {
        if (dto == null || dto.getName() == null || dto.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Activity name is required");
        }
    }

    private void validateTaskDto(PassportTaskDto dto) {
        if (dto == null || dto.getName() == null || dto.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Task name is required");
        }
    }

    private void validateSubtaskDto(PassportSubtaskDto dto) {
        if (dto == null || dto.getName() == null || dto.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Subtask name is required");
        }
    }
}
