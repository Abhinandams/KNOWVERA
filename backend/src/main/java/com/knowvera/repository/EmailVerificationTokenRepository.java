package com.knowvera.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowvera.model.EmailVerificationToken;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Integer> {
    Optional<EmailVerificationToken> findByToken(String token);
    long deleteByExpiresAtBefore(LocalDateTime threshold);
}
