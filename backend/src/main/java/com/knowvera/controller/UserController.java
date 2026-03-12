package com.knowvera.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.knowvera.dto.UserCreateRequestDTO;
import com.knowvera.dto.UserResponseDTO;
import com.knowvera.dto.UserUpdateRequestDTO;
import com.knowvera.security.UserPrincipal;
import com.knowvera.service.UserService;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("v1/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> getAllUsers(
            @RequestParam(name = "q", required = false) String q,
            @PageableDefault(size = 10, sort = "fname") Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable, q));
    }

    @PostMapping(consumes = "multipart/form-data")
public ResponseEntity<UserResponseDTO> createUser(
        @RequestParam String fname,
        @RequestParam String lname,
        @RequestParam String email,
        @RequestParam String password,
        @RequestParam(required = false) String phone,
        @RequestParam(required = false) String address,
        @RequestParam String role,
        @RequestParam(required = false) MultipartFile image) {

    UserCreateRequestDTO request = new UserCreateRequestDTO();
    request.setFname(fname);
    request.setLname(lname);
    request.setEmail(email);
    request.setPassword(password);
    request.setPhone(phone);
    request.setAddress(address);
    request.setRole(role);

    return ResponseEntity.status(HttpStatus.CREATED)
            .body(userService.createUser(request, image));
}

    @PutMapping("/{user_id}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable("user_id") Integer userId,
            @RequestBody UserUpdateRequestDTO request) {
        return ResponseEntity.ok(userService.updateUser(userId, request));
    }

    @GetMapping("/{user_id}")
    public ResponseEntity<UserResponseDTO> getUserById(
            @PathVariable("user_id") Integer userId,
            @AuthenticationPrincipal UserPrincipal principal) {

        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        boolean isSelf = principal.getUser().getUserId().equals(userId);

        if (!isAdmin && !isSelf) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only access your own profile");
        }

        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @DeleteMapping("/{user_id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable("user_id") Integer userId,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (!isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can delete users");
        }

        boolean isSelf = principal.getUser().getUserId().equals(userId);
        if (isSelf) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot delete the currently logged-in admin");
        }

        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }
}
