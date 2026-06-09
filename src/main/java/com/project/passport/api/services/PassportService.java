package com.project.passport.api.services;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.project.passport.api.dto.PassportDto;
import com.project.passport.api.enums.UserRole;
import com.project.passport.api.enums.WorkflowStatus;
import com.project.passport.api.model.AppUser;
import com.project.passport.api.model.Passport;
import com.project.passport.api.model.PassportProfile;
import com.project.passport.api.repository.PassportRepository;

@Service
public class PassportService {

    private final PassportRepository passportRepository;
    private final AppUserService appUserService;
    private final PassportProfileService passportProfileService;
    private final WorkflowService workflowService;

    public PassportService(PassportRepository passportRepository, AppUserService appUserService, PassportProfileService passportProfileService, WorkflowService workflowService) {
        this.passportRepository = passportRepository;
        this.appUserService = appUserService;
        this.passportProfileService = passportProfileService;
        this.workflowService = workflowService;
    }

    public Passport createPassport(PassportDto dto) {
        validatePassportDto(dto);

        Passport passport = new Passport();

        if (dto.getProfileId() != null) {
            PassportProfile profile = passportProfileService.getProfileById(dto.getProfileId());
            if (Boolean.FALSE.equals(profile.getActive())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passport profile is inactive");
            }
            if (!Boolean.TRUE.equals(profile.getPublished())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passport profile must be published before creating passports");
            }
            passport.setProfile(profile);
        }

        passport.setCandidateName(dto.getCandidateName());
        passport.setCandidateCpf(dto.getCandidateCpf());
        passport.setJobPosition(dto.getJobPosition());
        passport.setCandidateAccessKey(generateCandidateAccessKey());
        passport.setCreatedAt(LocalDate.now());
        passport.setStatus(WorkflowStatus.ABERTA);

        if (dto.getCreatedByRh() != null) {
            AppUser rhUser = appUserService.getAppUserById(dto.getCreatedByRh());
            validateUserRole(rhUser, UserRole.RH, "Only RH users can create passports");
            passport.setCreatedByRh(rhUser);
        }

        Passport savedPassport = passportRepository.save(passport);
        workflowService.generateDefaultWorkflow(savedPassport);
        return savedPassport;
    }

    public List<Passport> getAllPassports() {
        return passportRepository.findAll();
    }

    public Passport getPassportById(UUID id) {
        return passportRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Passport not found"));
    }

    public Passport getPassportByAccessKey(String accessKey) {
        if (isBlank(accessKey)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Candidate access key is required");
        }
        return passportRepository.findByCandidateAccessKey(accessKey.trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Passport not found for this access key"));
    }

    public Passport cancelPassport(UUID id) {
        Passport passport = getPassportById(id);
        passport.setStatus(WorkflowStatus.CANCELADA);
        return passportRepository.save(passport);
    }

    public void deletePassport(UUID id) {
        Passport passport = getPassportById(id);
        passportRepository.delete(passport);
    }

    private String generateCandidateAccessKey() {
        String key;
        do {
            key = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        } while (passportRepository.existsByCandidateAccessKey(key));
        return key;
    }

    private void validatePassportDto(PassportDto dto) {
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passport data is required");
        }
        if (isBlank(dto.getCandidateName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Candidate name is required");
        }
        if (isBlank(dto.getCandidateCpf())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Candidate CPF is required");
        }
        if (isBlank(dto.getJobPosition())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Job position is required");
        }
        if (dto.getCreatedByRh() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "RH user is required");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private void validateUserRole(AppUser user, UserRole expectedRole, String message) {
        if (user.getRole() != expectedRole) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is inactive");
        }
    }
}
