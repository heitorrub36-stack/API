package com.project.passport.api.services;

import org.springframework.stereotype.Service;

import com.project.passport.api.dto.DashboardDto;
import com.project.passport.api.enums.ManagerStatus;
import com.project.passport.api.enums.MedicalStatus;
import com.project.passport.api.enums.WorkflowStatus;
import com.project.passport.api.repository.PassportRepository;

@Service
public class DashboardService {

    private final PassportRepository passportRepository;

    public DashboardService(PassportRepository passportRepository) {
        this.passportRepository = passportRepository;
    }

    public DashboardDto getDashboardData() {
        long totalPassports = passportRepository.count();
        long pendingMedicalEvaluation = passportRepository.countByMedicalStatus(MedicalStatus.PENDENTE);
        long fitWaitingManagerStatus = passportRepository.countByMedicalStatusAndManagerStatus(
                MedicalStatus.APTO,
                ManagerStatus.PENDENTE
        );
        long openPassports = passportRepository.countByStatus(WorkflowStatus.ABERTA);
        long validPassports = passportRepository.countByStatus(WorkflowStatus.VALIDA);
        long invalidPassports = passportRepository.countByStatus(WorkflowStatus.INVALIDA);
        long canceledPassports = passportRepository.countByStatus(WorkflowStatus.CANCELADA);

        return new DashboardDto(totalPassports, pendingMedicalEvaluation, fitWaitingManagerStatus,
                openPassports, validPassports, invalidPassports, canceledPassports);
    }
}
