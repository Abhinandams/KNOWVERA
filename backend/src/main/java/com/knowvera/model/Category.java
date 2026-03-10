package com.knowvera.model;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@Entity
@Table(name = "category")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = "books")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    @EqualsAndHashCode.Include
    private Integer categoryId;

    @Column(name = "category_name", nullable = false, unique = true)
    private String name;

    @ManyToMany(mappedBy = "categories")
    @JsonIgnore
    private Set<Book> books = new HashSet<>();
}
