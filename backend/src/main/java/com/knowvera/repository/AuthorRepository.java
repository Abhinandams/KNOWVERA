package com.knowvera.repository;

import com.knowvera.model.Author;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AuthorRepository extends JpaRepository<Author, Integer> {

    Optional<Author> findByFullName(String fullName);
}