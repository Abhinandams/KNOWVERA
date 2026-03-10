package com.knowvera.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowvera.dto.AuthResponseDTO;
import com.knowvera.dto.LoginRequestDTO;
import com.knowvera.dto.RegisterAdminRequestDTO;
import com.knowvera.model.User;
import com.knowvera.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerAdmin(@RequestBody RegisterAdminRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerAdmin(request));
    }
}
