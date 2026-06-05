package com.project.passport.api.services;

import com.project.passport.api.dto.DashboardDto;
import com.project.passport.api.enums.ManagerDecision;
import com.project.passport.api.enums.MedicalResult;
import com.project.passport.api.enums.PassportStatus;
import com.project.passport.api.repository.PassportRepository;

import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final PassportRepository passportRepository;

    public DashboardService(PassportRepository passportRepository) {
        this.passportRepository = passportRepository;
    }

    public DashboardDto getDashboardData() {
        long totalPassports = passportRepository.count();
        long pendingMedicalEvaluation = passportRepository.countByMedicalResult(MedicalResult.PENDENTE);
        long fitWaitingManagerDecision = passportRepository.countByMedicalResultAndManagerDecision(
                MedicalResult.APTO,
                ManagerDecision.PENDENTE);
        long openPassports = passportRepository.countByStatus(PassportStatus.ABERTA);
        long validPassports = passportRepository.countByStatus(PassportStatus.VALIDA);
        long invalidPassports = passportRepository.countByStatus(PassportStatus.INVALIDA);
        long cancelledPassports = passportRepository.countByStatus(PassportStatus.CANCELADA);

        return new DashboardDto(totalPassports, pendingMedicalEvaluation, fitWaitingManagerDecision,
                openPassports, validPassports, invalidPassports, cancelledPassports);
    }

}
