package com.knowvera.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowvera.model.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {
    boolean existsByUserUserIdAndBookBookIdAndStatusIn(Integer userId, Integer bookId, List<String> statuses);
    List<Reservation> findByUserUserId(Integer userId);
    List<Reservation> findByStatusAndExpiryDateBefore(String status, LocalDateTime threshold);
    List<Reservation> findByBookBookIdAndStatusOrderByReservedOnAsc(Integer bookId, String status);
    Optional<Reservation> findFirstByUserUserIdAndBookBookIdAndStatusOrderByReservedOnAsc(
            Integer userId, Integer bookId, String status);
    boolean existsByBookBookIdAndStatusIn(Integer bookId, List<String> statuses);
    boolean existsByUserUserIdAndStatusIn(Integer userId, List<String> statuses);
    long countByUserUserIdAndStatusIn(Integer userId, List<String> statuses);
}
