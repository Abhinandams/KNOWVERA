package com.knowvera.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.knowvera.config.CacheConfig;
import com.knowvera.dto.UserCreateRequestDTO;
import com.knowvera.dto.UserResponseDTO;
import com.knowvera.dto.UserUpdateRequestDTO;
import com.knowvera.exception.ApiException;
import com.knowvera.model.User;
import com.knowvera.repository.IssueRepository;
import com.knowvera.repository.ReservationRepository;
import com.knowvera.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final IssueRepository issueRepository;
    private final ReservationRepository reservationRepository;
    private final EmailProbeService emailProbeService;

    @Cacheable(
            cacheNames = CacheConfig.USERS_PAGE,
            key = "T(java.util.Objects).toString(#q,'') + '|' + #pageable.toString()")
    public Page<UserResponseDTO> getAllUsers(Pageable pageable, String q) {
        if (hasText(q)) {
            return userRepository.searchActiveOrPendingUsers(q.trim(), pageable).map(this::toResponse);
        }
        return userRepository.findByStatusIgnoreCaseIn(List.of("active", "pending"), pageable)
                .map(this::toResponse);
    }

    @Cacheable(cacheNames = CacheConfig.USERS_BY_ID, key = "#userId")
    public UserResponseDTO getUserById(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if ("blocked".equalsIgnoreCase(user.getStatus())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "User not found");
        }
        return toResponse(user);
    }

    @CacheEvict(cacheNames = { CacheConfig.USERS_BY_ID, CacheConfig.USERS_PAGE }, allEntries = true)
    public UserResponseDTO createUser(UserCreateRequestDTO request) {
        return createUser(request, null);
    }

    @CacheEvict(cacheNames = { CacheConfig.USERS_BY_ID, CacheConfig.USERS_PAGE }, allEntries = true)
    public UserResponseDTO createUser(UserCreateRequestDTO request, MultipartFile image) {
        if (request == null || !hasText(request.getEmail())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        String normalizedEmail = request.getEmail().trim();
        userRepository.findByEmail(normalizedEmail).ifPresent(existing -> {
            throw new ApiException(HttpStatus.CONFLICT, "Email already exists");
        });

        boolean smtpVerified = emailProbeService.verifyAddress(normalizedEmail);
        if (emailProbeService.isStrict() && !smtpVerified) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email address could not be verified");
        }

        User user = new User();
        user.setFname(request.getFname());
        user.setLname(request.getLname());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setRole(request.getRole() == null ? "user" : request.getRole());
        user.setStatus(request.getStatus() == null ? "pending" : request.getStatus());
        user.setProfileImage(storeProfileImage(image));

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    @CacheEvict(cacheNames = { CacheConfig.USERS_BY_ID, CacheConfig.USERS_PAGE }, allEntries = true)
    public UserResponseDTO updateUser(Integer userId, UserUpdateRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (hasText(request.getEmail())) {
            String normalizedEmail = request.getEmail().trim();
            userRepository.findByEmail(normalizedEmail)
                    .filter(existing -> !existing.getUserId().equals(userId))
                    .ifPresent(existing -> {
                        throw new ApiException(HttpStatus.CONFLICT, "Email already in use");
                    });
            user.setEmail(normalizedEmail);
        }

        if (hasText(request.getFname())) {
            user.setFname(request.getFname().trim());
        }
        if (hasText(request.getLname())) {
            user.setLname(request.getLname().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (hasText(request.getRole())) {
            user.setRole(request.getRole().trim());
        }
        if (hasText(request.getStatus())) {
            user.setStatus(request.getStatus().trim());
        }
        if (hasText(request.getPassword())) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        return toResponse(userRepository.save(user));
    }

    @CacheEvict(cacheNames = { CacheConfig.USERS_BY_ID, CacheConfig.USERS_PAGE }, allEntries = true)
    public void deleteUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        boolean hasActiveIssue = issueRepository.existsByUserUserIdAndStatusIn(
                userId, List.of("issued", "overdue"));
        if (hasActiveIssue) {
            throw new ApiException(HttpStatus.CONFLICT, "Cannot delete user: user has issued books");
        }

        boolean hasActiveReservation = reservationRepository.existsByUserUserIdAndStatusIn(
                userId, List.of("reserved"));
        if (hasActiveReservation) {
            throw new ApiException(HttpStatus.CONFLICT, "Cannot delete user: user has active reservations");
        }

        user.setStatus("blocked");
        userRepository.save(user);
    }

    private UserResponseDTO toResponse(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setUserId(user.getUserId());
        dto.setFname(user.getFname());
        dto.setLname(user.getLname());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setProfileImage(user.getProfileImage());
        return dto;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String storeProfileImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            return null;
        }

        String originalName = image.getOriginalFilename();
        String extension = "";
        if (originalName != null) {
            int idx = originalName.lastIndexOf('.');
            if (idx >= 0) {
                extension = originalName.substring(idx);
            }
        }

        Path uploadDir = Paths.get("uploads");
        String fileName = UUID.randomUUID() + extension;
        Path target = uploadDir.resolve(fileName);

        try {
            Files.createDirectories(uploadDir);
            Files.copy(image.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store profile image");
        }

        return "/uploads/" + fileName;
    }
}
