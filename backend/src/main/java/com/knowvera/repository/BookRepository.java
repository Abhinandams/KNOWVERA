package com.knowvera.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;   
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.knowvera.model.Book;

import java.util.Optional;

@Repository
public interface BookRepository
        extends JpaRepository<Book, Integer>,
                JpaSpecificationExecutor<Book> {

    @EntityGraph(attributePaths = { "authors", "categories" })
    Page<Book> findByIsDeletedFalse(Pageable pageable);

    @Override
    @EntityGraph(attributePaths = { "authors", "categories" })
    Page<Book> findAll(Specification<Book> spec, Pageable pageable);

    @EntityGraph(attributePaths = { "authors", "categories" })
    @Query("select b from Book b where b.bookId = :id and b.isDeleted = false")
    Optional<Book> findDetailByIdAndNotDeleted(@Param("id") Integer id);
}
