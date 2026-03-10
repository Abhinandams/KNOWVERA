package com.knowvera.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.knowvera.model.User;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    List<User> findByStatusIgnoreCase(String status);
    Page<User> findByStatusIgnoreCase(String status, Pageable pageable);
    Optional<User> findByUserIdAndStatusIgnoreCase(Integer userId, String status);
}
