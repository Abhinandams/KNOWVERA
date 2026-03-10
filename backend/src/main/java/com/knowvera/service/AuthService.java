package com.knowvera.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.knowvera.dto.AuthResponseDTO;
import com.knowvera.dto.LoginRequestDTO;
import com.knowvera.dto.RegisterAdminRequestDTO;
import com.knowvera.exception.ApiException;
import com.knowvera.model.User;
import com.knowvera.repository.UserRepository;
import com.knowvera.security.JwtService;
import com.knowvera.security.UserPrincipal;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!"active".equalsIgnoreCase(user.getStatus())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "User is not active");
        }

        String storedPassword = user.getPasswordHash();
        if (storedPassword != null && !storedPassword.startsWith("$2") && storedPassword.equals(request.getPassword())) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            userRepository.save(user);
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException | DisabledException ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal);

        return AuthResponseDTO.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresInSeconds(jwtService.getExpirationSeconds())
                .userId(user.getUserId())
                .role(user.getRole())
                .email(user.getEmail())
                .build();
    }

    public User registerAdmin(RegisterAdminRequestDTO request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already exists");
        }

        User admin = new User();
        admin.setFname(request.getFname());
        admin.setLname(request.getLname());
        admin.setEmail(request.getEmail());
        admin.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        admin.setPhone(request.getPhone());
        admin.setAddress(request.getAddress());
        admin.setRole("admin");
        admin.setStatus("active");

        return userRepository.save(admin);
    }
}
