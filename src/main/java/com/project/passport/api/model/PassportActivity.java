package com.project.passport.api.model;

import com.project.passport.api.enums.UserRole;
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

import java.util.UUID;

@Entity
@Table(name = "passport_activity")
public class PassportActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    private Integer orderNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProcessStatus status;

    @Enumerated(EnumType.STRING)
    private UserRole responsibleRole;

    @ManyToOne
    @JoinColumn(name = "passport_id", nullable = false)
    private Passport passport;

    public PassportActivity() {
    }

    public UUID getId() { return id; }

    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public Integer getOrderNumber() { return orderNumber; }

    public void setOrderNumber(Integer orderNumber) { this.orderNumber = orderNumber; }

    public ProcessStatus getStatus() { return status; }

    public void setStatus(ProcessStatus status) { this.status = status; }

    public UserRole getResponsibleRole() { return responsibleRole; }

    public void setResponsibleRole(UserRole responsibleRole) { this.responsibleRole = responsibleRole; }

    public Passport getPassport() { return passport; }
    
    public void setPassport(Passport passport) { this.passport = passport; }
}
