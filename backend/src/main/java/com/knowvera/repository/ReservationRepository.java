package com.knowvera.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("""
            select r from Reservation r
            join r.user u
            join r.book b
            where (
              lower(u.fname) like lower(concat('%', :q, '%'))
              or lower(u.lname) like lower(concat('%', :q, '%'))
              or lower(u.email) like lower(concat('%', :q, '%'))
              or lower(b.title) like lower(concat('%', :q, '%'))
              or lower(b.isbn) like lower(concat('%', :q, '%'))
              or str(r.reservationId) like concat('%', :q, '%')
            )
            """)
    List<Reservation> searchAll(@Param("q") String q);

    @Query("""
            select r from Reservation r
            join r.user u
            join r.book b
            where u.userId = :userId
              and (
                lower(b.title) like lower(concat('%', :q, '%'))
                or lower(b.isbn) like lower(concat('%', :q, '%'))
                or str(r.reservationId) like concat('%', :q, '%')
              )
            """)
    List<Reservation> searchByUserId(@Param("userId") Integer userId, @Param("q") String q);
}
