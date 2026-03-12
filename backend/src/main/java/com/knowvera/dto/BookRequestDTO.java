package com.knowvera.dto;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonAlias;

import lombok.Data;

@Data
public class BookRequestDTO {

    private String title;
    // Legacy single-author field (frontend previously sent `author: string`).
    @JsonAlias("author")
    private String author;

    private String isbn;
    private String publisher;
    // Legacy single-category field (frontend previously sent `category: string`).
    @JsonAlias("category")
    private String category;

    private Integer totalCopies;
    private Integer availableCopies;
    private String description;

    private Set<String> authors;   
    private Set<String> categories; 
}
