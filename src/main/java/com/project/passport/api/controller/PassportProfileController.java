package com.project.passport.api.controller;

import com.project.passport.api.dto.PassportProfileDto;
import com.project.passport.api.model.PassportProfile;
import com.project.passport.api.services.PassportProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/passport-profiles")
public class PassportProfileController {

    private final PassportProfileService passportProfileService;

    public PassportProfileController(PassportProfileService passportProfileService) {
        this.passportProfileService = passportProfileService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PassportProfile createProfile(@RequestBody PassportProfileDto dto) {
        return passportProfileService.createProfile(dto);
    }

    @GetMapping
    public List<PassportProfile> getAllProfiles() {
        return passportProfileService.getAllProfiles();
    }

    @GetMapping("/{id}")
    public PassportProfile getProfileById(@PathVariable UUID id) {
        return passportProfileService.getProfileById(id);
    }

    @PutMapping("/{id}")
    public PassportProfile updateProfile(@PathVariable UUID id, @RequestBody PassportProfileDto dto) {
        return passportProfileService.updateProfile(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProfile(@PathVariable UUID id) {
        passportProfileService.deleteProfile(id);
    }
}
