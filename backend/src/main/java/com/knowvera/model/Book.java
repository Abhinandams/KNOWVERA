package com.knowvera.model;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@Entity
@Table(name = "books")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = { "authors", "categories" })
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "book_id")
    @EqualsAndHashCode.Include
    private Integer bookId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true, length = 20)
    private String isbn;

    @Column(length = 150)
    private String publisher;

    @Column(name = "total_copies", nullable = false)
    private Integer totalCopies;

    @Column(name = "available_copies", nullable = false)
    private Integer availableCopies;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @ManyToMany
    @JoinTable(
        name = "book_author",
        joinColumns = @JoinColumn(name = "book_id"),
        inverseJoinColumns = @JoinColumn(name = "author_id")
    )
    @JsonIgnore
    private Set<Author> authors = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "book_category",
        joinColumns = @JoinColumn(name = "book_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @JsonIgnore
    private Set<Category> categories = new HashSet<>();

    @OneToMany(mappedBy = "book")
    @JsonIgnore
    private List<Issue> issues;
}
