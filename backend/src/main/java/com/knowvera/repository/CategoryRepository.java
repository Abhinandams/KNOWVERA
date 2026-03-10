package com.knowvera.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowvera.model.Category;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    Optional<Category> findByName(String name);
}
