package com.knowvera.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowvera.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<String>> getCategories() {
        List<String> names = categoryRepository.findAll().stream()
                .map(c -> c.getName())
                .filter(n -> n != null && !n.trim().isEmpty())
                .map(String::trim)
                .sorted(String::compareToIgnoreCase)
                .toList();
        return ResponseEntity.ok(names);
    }
}

