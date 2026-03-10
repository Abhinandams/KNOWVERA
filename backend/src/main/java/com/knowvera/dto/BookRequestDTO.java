package com.knowvera.dto;

import java.util.Set;

import lombok.Data;

@Data
public class BookRequestDTO {

    private String title;
    private String isbn;
    private String publisher;
    private Integer totalCopies;
    private Integer availableCopies;
    private String description;

    private Set<String> authors;   
    private Set<String> categories; 
}
