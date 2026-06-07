package com.project.passport.api.controller;

import com.project.passport.api.dto.ElectronicSignatureDto;
import com.project.passport.api.enums.SignatureTargetType;
import com.project.passport.api.model.ElectronicSignature;
import com.project.passport.api.services.ElectronicSignatureService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/signatures")
public class ElectronicSignatureController {

    private final ElectronicSignatureService electronicSignatureService;

    public ElectronicSignatureController(ElectronicSignatureService electronicSignatureService) {
        this.electronicSignatureService = electronicSignatureService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ElectronicSignature sign(@RequestBody ElectronicSignatureDto dto) {
        return electronicSignatureService.sign(dto);
    }

    @GetMapping("/{id}")
    public ElectronicSignature getSignatureById(@PathVariable UUID id) {
        return electronicSignatureService.getSignatureById(id);
    }

    @GetMapping("/target/{targetType}/{targetId}")
    public List<ElectronicSignature> getSignaturesByTarget(
            @PathVariable SignatureTargetType targetType,
            @PathVariable UUID targetId
    ) {
        return electronicSignatureService.getSignaturesByTarget(targetType, targetId);
    }
}
