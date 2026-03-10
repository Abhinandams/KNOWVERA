package com.knowvera.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.knowvera.model.Fine;
import com.knowvera.security.UserPrincipal;
import com.knowvera.service.FineService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("v1")
@RequiredArgsConstructor
public class FineController {

    private final FineService fineService;

    @GetMapping("/admin/fines")
    public ResponseEntity<List<Fine>> getAllFines() {
        return ResponseEntity.ok(fineService.getAllFines());
    }

    @GetMapping("/users/{user_id}")
    public ResponseEntity<List<Fine>> getUserFines(
            @PathVariable("user_id") Integer userId,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        boolean isSelf = principal.getUser().getUserId().equals(userId);
        if (!isAdmin && !isSelf) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can view only your own fines");
        }
        return ResponseEntity.ok(fineService.getFinesByUserId(userId));
    }
}
