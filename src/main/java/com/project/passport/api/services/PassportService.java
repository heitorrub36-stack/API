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
import com.project.passport.api.enums.ManagerDecision;
import com.project.passport.api.enums.MedicalResult;
import com.project.passport.api.enums.PassportStatus;
import com.project.passport.api.model.Passport;
import com.project.passport.api.repository.PassportRepository;

@Service
public class PassportService {
    
    private final PassportRepository passportRepository;

    public PassportService(PassportRepository passportRepository) {
        this.passportRepository = passportRepository;
    }

    public Passport createPassport(PassportDto dto){
        validatePassportDto(dto);

        Passport passport = new Passport();
        passport.setCandidateName(dto.getCandidateName());
        passport.setCandidateCpf(dto.getCandidateCpf());
        passport.setJobPosition(dto.getJobPosition());
        passport.setCreatedAt(LocalDate.now());
        passport.setStatus(PassportStatus.ABERTA);
        passport.setMedicalResult(MedicalResult.PENDENTE);
        passport.setManagerDecision(ManagerDecision.PENDENTE);

        return passportRepository.save(passport);
    }

    public List<Passport> getAllPassports(){
        return passportRepository.findAll();
    }

    public Passport getPassportById(UUID id){
       return passportRepository.findById(id)
               .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Passport not found"));
    }

    public Passport updateMedicalReview(UUID id, MedicalReviewDto dto){
        if (dto == null || dto.getMedicalResult() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Medical result is required");
        }

        Passport passport = getPassportById(id);
        ensureNotCancelled(passport);

        passport.setMedicalResult(dto.getMedicalResult());
        passport.setMedicalNotes(dto.getMedicalNotes());

        updateStatus(passport);

        return passportRepository.save(passport);
    }


     public Passport updateManagerReview(UUID id, ManagerReviewDto dto){
        if (dto == null || dto.getManagerDecision() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Manager decision is required");
        }

        Passport passport = getPassportById(id);
        ensureNotCancelled(passport);
        
        passport.setManagerDecision(dto.getManagerDecision());
        passport.setManagerNotes(dto.getManagerNotes());

        updateStatus(passport);

        return passportRepository.save(passport);
    }

    private void updateStatus(Passport passport) {
        if (passport.getStatus() == PassportStatus.CANCELADA) {
            return;
        }

        if (passport.getMedicalResult() == MedicalResult.INAPTO
                || passport.getManagerDecision() == ManagerDecision.REPROVADO) {
            passport.setStatus(PassportStatus.INVALIDA);
        } else if (passport.getMedicalResult() == MedicalResult.APTO
                && passport.getManagerDecision() == ManagerDecision.APROVADO) {
            passport.setStatus(PassportStatus.VALIDA);
        } else {
            passport.setStatus(PassportStatus.ABERTA);
        }
    }

    public Passport cancelPassport(UUID id) {
        Passport passport = getPassportById(id);
        passport.setStatus(PassportStatus.CANCELADA);
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
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private void ensureNotCancelled(Passport passport) {
        if (passport.getStatus() == PassportStatus.CANCELADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cancelled passport cannot be reviewed");
        }
    }
}
