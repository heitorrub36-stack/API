package com.project.passport.api.services;

import com.project.passport.api.dto.PassportProfileDto;
import com.project.passport.api.model.PassportProfile;
import com.project.passport.api.repository.PassportProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class PassportProfileService {

    private final PassportProfileRepository passportProfileRepository;

    public PassportProfileService(PassportProfileRepository passportProfileRepository) {
        this.passportProfileRepository = passportProfileRepository;
    }

    public PassportProfile createProfile(PassportProfileDto dto) {
        validateProfileDto(dto);

        PassportProfile profile = new PassportProfile();
        profile.setName(dto.getName());
        profile.setDescription(dto.getDescription());
        profile.setActive(dto.getActive() != null ? dto.getActive() : true);

        return passportProfileRepository.save(profile);
    }

    public List<PassportProfile> getAllProfiles() {
        return passportProfileRepository.findAll();
    }

    public PassportProfile getProfileById(UUID id) {
        return passportProfileRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Passport profile not found"));
    }

    public PassportProfile updateProfile(UUID id, PassportProfileDto dto) {
        validateProfileDto(dto);

        PassportProfile profile = getProfileById(id);
        profile.setName(dto.getName());
        profile.setDescription(dto.getDescription());
        profile.setActive(dto.getActive() != null ? dto.getActive() : true);

        return passportProfileRepository.save(profile);
    }

    public void deleteProfile(UUID id) {
        PassportProfile profile = getProfileById(id);
        passportProfileRepository.delete(profile);
    }

    private void validateProfileDto(PassportProfileDto dto) {
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile data is required");
        }
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile name is required");
        }
    }
}
