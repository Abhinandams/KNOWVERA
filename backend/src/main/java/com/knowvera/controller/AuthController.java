package com.knowvera.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
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
        AuthResponseDTO response = authService.login(request);
        ResponseCookie cookie = ResponseCookie.from("access_token", response.getToken())
            .httpOnly(true)
            .secure(false)
            .path("/")
            .maxAge(response.getExpiresInSeconds() != null ? response.getExpiresInSeconds() : 0)
            .sameSite("Lax")
            .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(response);
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerAdmin(@RequestBody RegisterAdminRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerAdmin(request));
    }

}
