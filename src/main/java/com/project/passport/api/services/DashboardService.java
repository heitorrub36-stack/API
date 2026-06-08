package com.project.passport.api.services;

import org.springframework.stereotype.Service;

import com.project.passport.api.dto.DashboardDto;
import com.project.passport.api.enums.ManagerStatus;
import com.project.passport.api.enums.MedicalStatus;
import com.project.passport.api.enums.ProcessStatus;
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
        long openPassports = passportRepository.countByStatus(ProcessStatus.ABERTA);
        long validPassports = passportRepository.countByStatus(ProcessStatus.VALIDA);
        long invalidPassports = passportRepository.countByStatus(ProcessStatus.INVALIDA);
        long canceledPassports = passportRepository.countByStatus(ProcessStatus.CANCELADA);

        return new DashboardDto(totalPassports, pendingMedicalEvaluation, fitWaitingManagerStatus,
                openPassports, validPassports, invalidPassports, canceledPassports);
    }
}
