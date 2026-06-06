package com.project.passport.api.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.project.passport.api.dto.AppUserDto;
import com.project.passport.api.model.AppUser;
import com.project.passport.api.services.AppUserService;

@RestController
@RequestMapping("/api/users")
public class AppUserController {

    private final AppUserService appUserService;

    public AppUserController(AppUserService appUserService){
        this.appUserService = appUserService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppUser createUser(@RequestBody AppUserDto appUserDto){
        return appUserService.createAppUser(appUserDto);
    }

    @GetMapping
    public List<AppUser> getAllUser(){
        return appUserService.getAllAppUsers();
    }

    @GetMapping("/{id}")
    public AppUser getAppUserById(@PathVariable UUID id){
        return appUserService.getAppUserById(id);
    }

    @PutMapping("/{id}")
    public AppUser updateUser(@PathVariable UUID id, @RequestBody AppUserDto appUserDto){
        return appUserService.updateAppUser(id, appUserDto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable UUID id){
        appUserService.deleteAppUser(id);
    }
    
}
