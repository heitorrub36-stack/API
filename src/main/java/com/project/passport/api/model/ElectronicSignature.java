package com.project.passport.api.model;

import com.project.passport.api.enums.SignatureTargetType;
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

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "electronic_signature")
public class ElectronicSignature {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne
    @JoinColumn(name = "signed_by_user_id", nullable = false)
    private AppUser signedBy;

    @Column(nullable = false)
    private LocalDateTime signedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SignatureTargetType targetType;

    @Column(nullable = false)
    private UUID targetId;

    public ElectronicSignature() {
    }

    public UUID getId() { return id; }

    public void setId(UUID id) { this.id = id; }

    public String getToken() { return token; }

    public void setToken(String token) { this.token = token; }

    public AppUser getSignedBy() { return signedBy; }

    public void setSignedBy(AppUser signedBy) { this.signedBy = signedBy; }

    public LocalDateTime getSignedAt() { return signedAt; }

    public void setSignedAt(LocalDateTime signedAt) { this.signedAt = signedAt; }

    public SignatureTargetType getTargetType() { return targetType; }

    public void setTargetType(SignatureTargetType targetType) { this.targetType = targetType; }

    public UUID getTargetId() { return targetId; }
    
    public void setTargetId(UUID targetId) { this.targetId = targetId; }
}
