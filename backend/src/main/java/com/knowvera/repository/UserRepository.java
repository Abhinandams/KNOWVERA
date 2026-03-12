package com.knowvera.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.knowvera.model.User;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    List<User> findByStatusIgnoreCase(String status);
    Page<User> findByStatusIgnoreCase(String status, Pageable pageable);
    Page<User> findByStatusIgnoreCaseIn(List<String> statuses, Pageable pageable);
    Optional<User> findByUserIdAndStatusIgnoreCase(Integer userId, String status);

    @Query("""
            select u from User u
            where lower(u.status) = 'active'
              and (
                lower(u.fname) like lower(concat('%', :q, '%'))
                or lower(u.lname) like lower(concat('%', :q, '%'))
                or lower(u.email) like lower(concat('%', :q, '%'))
                or str(u.userId) like concat('%', :q, '%')
              )
            """)
    Page<User> searchActiveUsers(@Param("q") String q, Pageable pageable);

    @Query("""
            select u from User u
            where lower(u.status) in ('active', 'pending')
              and (
                lower(u.fname) like lower(concat('%', :q, '%'))
                or lower(u.lname) like lower(concat('%', :q, '%'))
                or lower(u.email) like lower(concat('%', :q, '%'))
                or str(u.userId) like concat('%', :q, '%')
              )
            """)
    Page<User> searchActiveOrPendingUsers(@Param("q") String q, Pageable pageable);
}
