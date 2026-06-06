package com.project.passport.api.services;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.project.passport.api.dto.AppUserDto;
import com.project.passport.api.model.AppUser;
import com.project.passport.api.repository.AppUserRepository;

@Service
public class AppUserService {

    private final AppUserRepository appUserRepository;

    public AppUserService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    public AppUser createAppUser(AppUserDto appUserDto){
        validateAppUserDto(appUserDto);

        if(appUserRepository.existsByEmail(appUserDto.getEmail())){
            throw new IllegalArgumentException("Email já existe");
        }

        AppUser appUser = new AppUser();
        appUser.setName(appUserDto.getName());
        appUser.setEmail(appUserDto.getEmail());
        appUser.setRole(appUserDto.getRole());
        appUser.setActive(appUserDto.getActive() != null ? appUserDto.getActive() : true);

        return appUserRepository.save(appUser);
    }



    public List<AppUser> getAllAppUsers(){
        return appUserRepository.findAll();
    }

    public AppUser getAppUserbyId(UUID id){

        return appUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
    public AppUser upadateAppUser(UUID id, AppUserDto appUserDto){

        validateAppUserDto(appUserDto);

        AppUser appUser = getAppUserbyId(id);

        appUser.setName(appUserDto.getName());
        appUser.setEmail(appUserDto.getEmail());
        appUser.setRole(appUserDto.getRole());
        appUser.setActive(appUserDto.getActive() != null ? appUserDto.getActive() : true);

        return appUserRepository.save(appUser);
        
    }

    public void deleteAppUser(UUID id){
        AppUser appUser = getAppUserbyId(id);
        appUserRepository.delete(appUser);
    }

    private void validateAppUserDto(AppUserDto appUserDto) {
       
        if(appUserDto == null){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User data is required");
        }

        if(isBlank(appUserDto.getName())){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User name is required");
        }

        if (isBlank(appUserDto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User email is required");
        }

        if (appUserDto.getRole() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User role is required");
        }

    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
    
}
