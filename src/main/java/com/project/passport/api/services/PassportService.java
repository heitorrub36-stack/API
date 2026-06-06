package com.project.passport.api.services;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.project.passport.api.dto.ManagerReviewDto;
import com.project.passport.api.dto.MedicalReviewDto;
import com.project.passport.api.dto.PassportDto;
import com.project.passport.api.enums.ManagerStatus;
import com.project.passport.api.enums.MedicalStatus;
import com.project.passport.api.enums.UserRole;
import com.project.passport.api.enums.WorkflowStatus;
import com.project.passport.api.model.AppUser;
import com.project.passport.api.model.Passport;
import com.project.passport.api.repository.PassportRepository;

@Service
public class PassportService {

    private final PassportRepository passportRepository;
    private final AppUserService appUserService;

    public PassportService(PassportRepository passportRepository, AppUserService appUserService) {
        this.passportRepository = passportRepository;
        this.appUserService = appUserService;
    }

    public Passport createPassport(PassportDto dto) {
        validatePassportDto(dto);

        Passport passport = new Passport();
        passport.setCandidateName(dto.getCandidateName());
        passport.setCandidateCpf(dto.getCandidateCpf());
        passport.setJobPosition(dto.getJobPosition());
        passport.setCreatedAt(LocalDate.now());
        passport.setStatus(WorkflowStatus.ABERTA);
        passport.setMedicalStatus(MedicalStatus.PENDENTE);
        passport.setManagerStatus(ManagerStatus.PENDENTE);

        if (dto.getCreatedByRh() != null) {
            AppUser rhUser = appUserService.getAppUserById(dto.getCreatedByRh());
            validateUserRole(rhUser, UserRole.RH, "Only RH users can create passports");
            passport.setCreatedByRh(rhUser);
        }

        return passportRepository.save(passport);
    }


    public List<Passport> getAllPassports() {
        return passportRepository.findAll();
    }

    public Passport getPassportById(UUID id) {
        return passportRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Passport not found"));
    }

    public Passport updateMedicalReview(UUID id, MedicalReviewDto dto) {
        if (dto == null || dto.getMedicalStatus() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Medical status is required");
        }

        Passport passport = getPassportById(id);
        ensureNotCancelled(passport);

        passport.setMedicalStatus(dto.getMedicalStatus());
        passport.setMedicalNotes(dto.getMedicalNotes());

        if (dto.getMedicalReviewerId() != null) {
            AppUser medicalUser = appUserService.getAppUserById(dto.getMedicalReviewerId());
            validateUserRole(medicalUser, UserRole.MEDICINA_TRABALHO,
                    "Only Medicina do Trabalho can review medical status");
            passport.setMedicalReviewer(medicalUser);
        }

        updateStatus(passport);

        return passportRepository.save(passport);
    }

    public Passport updateManagerReview(UUID id, ManagerReviewDto dto) {
        if (dto == null || dto.getManagerStatus() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Manager status is required");
        }

        Passport passport = getPassportById(id);
        ensureNotCancelled(passport);

        passport.setManagerStatus(dto.getManagerStatus());
        passport.setManagerNotes(dto.getManagerNotes());

        if (dto.getManagerReviewerId() != null) {
            AppUser managerUser = appUserService.getAppUserById(dto.getManagerReviewerId());
            validateUserRole(managerUser, UserRole.GERENTE, "Only Gerente can review manager status");
            passport.setManagerReviewer(managerUser);
        }

        updateStatus(passport);

        return passportRepository.save(passport);
    }

    private void updateStatus(Passport passport) {
        if (passport.getStatus() == WorkflowStatus.CANCELADA) {
            return;
        }

        if (passport.getMedicalStatus() == MedicalStatus.INAPTO
                || passport.getManagerStatus() == ManagerStatus.REPROVADO) {
            passport.setStatus(WorkflowStatus.INVALIDA);
        } else if (passport.getMedicalStatus() == MedicalStatus.APTO
                && passport.getManagerStatus() == ManagerStatus.APROVADO) {
            passport.setStatus(WorkflowStatus.VALIDA);
        } else {
            passport.setStatus(WorkflowStatus.ABERTA);
        }
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

        if(dto.getCreatedByRh() == null){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "RH user is required");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private void ensureNotCancelled(Passport passport) {
        if (passport.getStatus() == WorkflowStatus.CANCELADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cancelled passport cannot be reviewed");
        }
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
