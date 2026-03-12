package com.knowvera.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.knowvera.dto.BookRequestDTO;
import com.knowvera.dto.BookResponseDTO;
import com.knowvera.service.BookService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("v1/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;


    @GetMapping
    public Page<BookResponseDTO> getAllBooks(
            @PageableDefault(size = 10, sort = "title") Pageable pageable) {
        return bookService.getAllBooks(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponseDTO> getBookById(@PathVariable Integer id) {
        return ResponseEntity.ok(bookService.getBookById(id));
    }
    
    @GetMapping("/search")
    public Page<BookResponseDTO> searchBooks(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String publisher,
            @RequestParam(required = false) String availability,
            @PageableDefault(size = 100, sort = "title") Pageable pageable) {
        return bookService.searchBooks(q, title, author, category, publisher, availability, pageable);
    }

    @PostMapping
public BookResponseDTO createBook(@RequestBody BookRequestDTO request) {
    return bookService.saveBook(request);
}

@PutMapping("/{id}")
public ResponseEntity<BookResponseDTO> updateBook(
        @PathVariable Integer id,
        @RequestBody BookRequestDTO request) {

    return ResponseEntity.ok(bookService.updateBook(id, request));
}    


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Integer id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

}
