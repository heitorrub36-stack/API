package com.project.passport.api.dto;

import com.project.passport.api.enums.UserRole;

import java.time.LocalDate;

public class PassportSubtaskDto {

    private String name;
    private String description;
    private Integer orderNumber;
    private LocalDate deadline;
    private UserRole responsibleRole;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getOrderNumber() { return orderNumber; }
    public void setOrderNumber(Integer orderNumber) { this.orderNumber = orderNumber; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public UserRole getResponsibleRole() { return responsibleRole; }
    public void setResponsibleRole(UserRole responsibleRole) { this.responsibleRole = responsibleRole; }
}
