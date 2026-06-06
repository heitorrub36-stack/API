package com.project.passport.api.controller;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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

    public AppUser createUser(@RequestBody AppUserDto appUserDto){
        return appUserService.createAppUser(appUserDto);
    }

    
}
