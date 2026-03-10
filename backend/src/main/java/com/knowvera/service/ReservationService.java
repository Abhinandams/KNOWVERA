package com.knowvera.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowvera.dto.ReservationRequestDTO;
import com.knowvera.exception.ApiException;
import com.knowvera.model.Book;
import com.knowvera.model.Reservation;
import com.knowvera.model.User;
import com.knowvera.repository.BookRepository;
import com.knowvera.repository.IssueRepository;
import com.knowvera.repository.ReservationRepository;
import com.knowvera.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private static final int AVAILABLE_BOOK_RESERVATION_DAYS = 1;
    private static final int QUEUE_RESERVATION_DAYS = 4;
    private static final int MAX_ACTIVE_RESERVATIONS_PER_USER = 3;

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final IssueRepository issueRepository;

    public List<Reservation> getAllReservations() {
        cancelExpiredReservations();
        return reservationRepository.findAll();
    }

    public List<Reservation> getReservationsByUserId(Integer userId) {
        cancelExpiredReservations();
        return reservationRepository.findByUserUserId(userId);
    }

    @Transactional
    public Reservation reserveBook(ReservationRequestDTO request) {
        cancelExpiredReservations();
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Book not found"));

        boolean alreadyReserved = reservationRepository
                .existsByUserUserIdAndBookBookIdAndStatusIn(
                        user.getUserId(),
                        book.getBookId(),
                        List.of("reserved"));
        boolean alreadyIssued = issueRepository
                .existsByUserUserIdAndBookBookIdAndStatusIn(
                        user.getUserId(),
                        book.getBookId(),
                        List.of("issued", "overdue"));
        long activeReservationCount = reservationRepository.countByUserUserIdAndStatusIn(
                user.getUserId(),
                List.of("reserved"));

        if (alreadyReserved || alreadyIssued) {
            throw new ApiException(HttpStatus.CONFLICT, "Same book cannot be issued/reserved at the same time by this user");
        }
        if (activeReservationCount >= MAX_ACTIVE_RESERVATIONS_PER_USER) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "User cannot have more than 3 active reservations");
        }

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setBook(book);
        LocalDateTime now = LocalDateTime.now();
        reservation.setReservedOn(now);
        reservation.setStatus("reserved");
        boolean bookAvailableNow = book.getAvailableCopies() > 0;
        if (bookAvailableNow) {
            book.setAvailableCopies(book.getAvailableCopies() - 1);
            bookRepository.saveAndFlush(book);
        }
        int holdDays = bookAvailableNow ? AVAILABLE_BOOK_RESERVATION_DAYS : QUEUE_RESERVATION_DAYS;
        reservation.setExpiryDate(now.plusDays(holdDays));

        return reservationRepository.save(reservation);
    }

    @Transactional
    public Reservation updateReservationStatus(Integer reservationId, String action) {
        if (action == null || action.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Action is required");
        }

        String normalizedAction = action.trim().toLowerCase();
        if ("cancel".equals(normalizedAction)) {
            return applyCancelReservation(reservationId);
        }
        if ("collect".equals(normalizedAction)) {
            return applyCollectReservation(reservationId);
        }
        throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid action. Use cancel or collect");
    }

    private Reservation applyCancelReservation(Integer reservationId) {
        cancelExpiredReservations();
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Reservation not found"));

        if ("cancelled".equalsIgnoreCase(reservation.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "Reservation already cancelled");
        }

        if (isImmediateHoldReservation(reservation)) {
            releaseHeldCopy(reservation.getBook());
        }

        reservation.setStatus("cancelled");
        return reservationRepository.save(reservation);
    }

    private Reservation applyCollectReservation(Integer reservationId) {
        cancelExpiredReservations();
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Reservation not found"));

        if (!"reserved".equalsIgnoreCase(reservation.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only reserved entry can be collected");
        }
        if ("cancelled".equalsIgnoreCase(reservation.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "Cancelled reservation cannot be collected");
        }
        if ("collected".equalsIgnoreCase(reservation.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "Reservation already collected");
        }
        if (reservation.getExpiryDate() != null && reservation.getExpiryDate().isBefore(LocalDateTime.now())) {
            if (isImmediateHoldReservation(reservation)) {
                releaseHeldCopy(reservation.getBook());
            }
            reservation.setStatus("cancelled");
            reservationRepository.save(reservation);
            throw new ApiException(HttpStatus.GONE, "Reservation expired and was cancelled");
        }

        if (!isImmediateHoldReservation(reservation)) {
            Book book = reservation.getBook();
            if (book.getAvailableCopies() <= 0) {
                throw new ApiException(HttpStatus.CONFLICT, "Book not available yet. You are still in queue");
            }

            List<Reservation> queue = reservationRepository.findByBookBookIdAndStatusOrderByReservedOnAsc(
                    book.getBookId(), "reserved");
            Reservation firstQueued = queue.stream()
                    .filter(r -> !isImmediateHoldReservation(r))
                    .findFirst()
                    .orElse(null);
            if (firstQueued != null && !firstQueued.getReservationId().equals(reservationId)) {
                throw new ApiException(HttpStatus.CONFLICT, "Another user is ahead in queue");
            }

            book.setAvailableCopies(book.getAvailableCopies() - 1);
            bookRepository.saveAndFlush(book);
        }

        reservation.setStatus("collected");
        reservation.setExpiryDate(null);
        return reservationRepository.save(reservation);
    }

    @Scheduled(fixedDelayString = "${reservation.cleanup-ms:8640000}")
    @Transactional
    public void cancelExpiredReservations() {
        List<Reservation> expired = reservationRepository.findByStatusAndExpiryDateBefore("reserved", LocalDateTime.now());
        for (Reservation reservation : expired) {
            if (isImmediateHoldReservation(reservation)) {
                releaseHeldCopy(reservation.getBook());
            }
            reservation.setStatus("cancelled");
            reservationRepository.save(reservation);
        }
    }

    private boolean isImmediateHoldReservation(Reservation reservation) {
        if (reservation.getReservedOn() == null || reservation.getExpiryDate() == null) {
            return false;
        }
        LocalDateTime expectedImmediateExpiry = reservation.getReservedOn().plusDays(AVAILABLE_BOOK_RESERVATION_DAYS);
        return !reservation.getExpiryDate().isAfter(expectedImmediateExpiry);
    }

    private void releaseHeldCopy(Book book) {
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.saveAndFlush(book);
    }
}
