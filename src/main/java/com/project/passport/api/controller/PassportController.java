package com.project.passport.api.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.passport.api.dto.ManagerReviewDto;
import com.project.passport.api.dto.MedicalReviewDto;
import com.project.passport.api.dto.PassportDto;
import com.project.passport.api.model.Passport;
import com.project.passport.api.services.PassportService;

@RestController
@RequestMapping("/api/passports")
public class PassportController {

    private final PassportService passportService;

    public PassportController(PassportService passportService) {
        this.passportService = passportService;
    }

    @GetMapping
    public List<Passport> getAllPassports() {
        return passportService.getAllPassports();
    }

    @GetMapping("/access/{accessKey}")
    public Passport getPassportByAccessKey(@PathVariable String accessKey) {
        return passportService.getPassportByAccessKey(accessKey);
    }

    @GetMapping("/{id}")
    public Passport getPassportById(@PathVariable UUID id) {
        return passportService.getPassportById(id);
    }

    @PostMapping
    public Passport createPassport(@RequestBody PassportDto dto) {
        return passportService.createPassport(dto);
    }

    @PatchMapping("/{id}/medical-review")
    public Passport updateMedicalReview(@PathVariable UUID id, @RequestBody MedicalReviewDto dto) {
        return passportService.updateMedicalReview(id, dto);
    }

    @PatchMapping("/{id}/manager-review")
    public Passport updateManagerReview(@PathVariable UUID id, @RequestBody ManagerReviewDto dto) {
        return passportService.updateManagerReview(id, dto);
    }

    @PatchMapping("/{id}/cancel")
    public Passport cancelPassport(@PathVariable UUID id) {
        return passportService.cancelPassport(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePassport(@PathVariable UUID id) {
        passportService.deletePassport(id);
        return ResponseEntity.noContent().build();
    }
}

