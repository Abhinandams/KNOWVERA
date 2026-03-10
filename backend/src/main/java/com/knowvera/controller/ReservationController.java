package com.knowvera.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.knowvera.dto.ReservationRequestDTO;
import com.knowvera.model.Reservation;
import com.knowvera.security.UserPrincipal;
import com.knowvera.service.ReservationService;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("v1/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations(@AuthenticationPrincipal UserPrincipal principal) {
        if (isAdmin(principal)) {
            return ResponseEntity.ok(reservationService.getAllReservations());
        }
        return ResponseEntity.ok(reservationService.getReservationsByUserId(principal.getUser().getUserId()));
    }

    @PostMapping
    public ResponseEntity<Reservation> reserveBook(
            @RequestBody ReservationRequestDTO request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (request.getBookId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "book_id is required");
        }

        if (isAdmin(principal)) {
            if (request.getUserId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "user_id is required for admin");
            }
        } else {
            request.setUserId(principal.getUser().getUserId());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(reservationService.reserveBook(request));
    }

    @PatchMapping("/{reservation_id}")
    public ResponseEntity<Reservation> updateReservationStatus(
            @PathVariable("reservation_id") Integer reservationId,
            @Parameter(description = "Reservation action", required = true, schema = @Schema(allowableValues = {
                    "cancel", "collect" })) @RequestParam("action") String action,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (action == null || action.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "action is required");
        }
        validateReservationAccess(reservationId, principal);
        return ResponseEntity.ok(reservationService.updateReservationStatus(reservationId, action));
    }

    private void validateReservationAccess(Integer reservationId, UserPrincipal principal) {
        if (isAdmin(principal)) {
            return;
        }
        boolean ownsReservation = reservationService.getReservationsByUserId(principal.getUser().getUserId())
                .stream()
                .anyMatch(r -> r.getReservationId().equals(reservationId));
        if (!ownsReservation) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can modify only your reservations");
        }
    }

    private boolean isAdmin(UserPrincipal principal) {
        return principal.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }
}
