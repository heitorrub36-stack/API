package com.project.passport.api.model;

import com.project.passport.api.enums.UserRole;
import com.project.passport.api.enums.WorkflowStatus;
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
@Table(name = "passport_task")
public class PassportTask {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    private Integer orderNumber;

    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkflowStatus status;

    @Enumerated(EnumType.STRING)
    private UserRole responsibleRole;

    @ManyToOne
    @JoinColumn(name = "activity_id", nullable = false)
    private PassportActivity activity;

    public PassportTask() {
    }

    public UUID getId() { return id; }

    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public Integer getOrderNumber() { return orderNumber; }

    public void setOrderNumber(Integer orderNumber) { this.orderNumber = orderNumber; }

    public LocalDate getDeadline() { return deadline; }

    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public WorkflowStatus getStatus() { return status; }

    public void setStatus(WorkflowStatus status) { this.status = status; }

    public UserRole getResponsibleRole() { return responsibleRole; }

    public void setResponsibleRole(UserRole responsibleRole) { this.responsibleRole = responsibleRole; }

    public PassportActivity getActivity() { return activity; }
    
    public void setActivity(PassportActivity activity) { this.activity = activity; }
}
