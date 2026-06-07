package com.project.passport.api.dto;

import com.project.passport.api.enums.SignatureTargetType;

import java.util.UUID;

public class ElectronicSignatureDto {

    private UUID signedByUserId;
    private SignatureTargetType targetType;
    private UUID targetId;

    public UUID getSignedByUserId() { return signedByUserId; }
    public void setSignedByUserId(UUID signedByUserId) { this.signedByUserId = signedByUserId; }
    public SignatureTargetType getTargetType() { return targetType; }
    public void setTargetType(SignatureTargetType targetType) { this.targetType = targetType; }
    public UUID getTargetId() { return targetId; }
    public void setTargetId(UUID targetId) { this.targetId = targetId; }
}
