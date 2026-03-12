package com.knowvera.service;

import java.util.Collections;
import java.util.List;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

import com.knowvera.dto.BookRequestDTO;
import com.knowvera.dto.BookResponseDTO;
import com.knowvera.exception.ApiException;
import com.knowvera.model.Author;
import com.knowvera.model.Book;
import com.knowvera.model.Category;
import com.knowvera.repository.AuthorRepository;
import com.knowvera.repository.BookRepository;
import com.knowvera.repository.CategoryRepository;
import com.knowvera.repository.IssueRepository;
import com.knowvera.repository.ReservationRepository;
import com.knowvera.specification.BookSpecification;
import com.knowvera.config.CacheConfig;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;
    private final IssueRepository issueRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationService reservationService;

    public BookService(BookRepository bookRepository,
            AuthorRepository authorRepository,
            CategoryRepository categoryRepository,
            IssueRepository issueRepository,
            ReservationRepository reservationRepository,
            ReservationService reservationService) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.categoryRepository = categoryRepository;
        this.issueRepository = issueRepository;
        this.reservationRepository = reservationRepository;
        this.reservationService = reservationService;
    }

    @Cacheable(cacheNames = CacheConfig.BOOKS_PAGE, key = "#pageable.toString()")
    public Page<BookResponseDTO> getAllBooks(Pageable pageable) {
        Page<Book> books = bookRepository.findByIsDeletedFalse(pageable);
        return books.map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheConfig.BOOKS_BY_ID, key = "#id")
    public BookResponseDTO getBookById(Integer id) {
        Book book = bookRepository.findDetailByIdAndNotDeleted(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Book not found"));

        return convertToDTO(book);
    }

    @Cacheable(
            cacheNames = CacheConfig.BOOKS_SEARCH,
            key = "T(java.util.Objects).toString(#q,'') + '|' + T(java.util.Objects).toString(#title,'') + '|' + T(java.util.Objects).toString(#author,'') + '|' + T(java.util.Objects).toString(#category,'') + '|' + T(java.util.Objects).toString(#publisher,'') + '|' + T(java.util.Objects).toString(#availability,'') + '|' + #pageable.toString()")
    public Page<BookResponseDTO> searchBooks(
            String q,
            String title,
            String author,
            String category,
            String publisher,
            String availability,
            Pageable pageable) {
        Specification<Book> spec = BookSpecification.searchBooks(q, title, author, category, publisher, availability);
        Page<Book> books = bookRepository.findAll(spec, pageable);
        return books.map(this::convertToDTO);
    }

    @Transactional
    @CacheEvict(cacheNames = { CacheConfig.BOOKS_BY_ID, CacheConfig.BOOKS_PAGE, CacheConfig.BOOKS_SEARCH }, allEntries = true)
    public BookResponseDTO saveBook(BookRequestDTO request) {
        normalizeBookRequest(request);
        validateBookRequest(request);

        Book book = new Book();
        book.setTitle(request.getTitle());
        book.setIsbn(request.getIsbn());
        book.setPublisher(request.getPublisher());
        book.setTotalCopies(request.getTotalCopies());
        book.setAvailableCopies(request.getAvailableCopies());
        book.setDescription(request.getDescription());
        book.setDeleted(false);
        book.setAuthors(resolveAuthors(request.getAuthors()));
        book.setCategories(resolveCategories(request.getCategories()));

        Book saved = bookRepository.save(book);
        return convertToDTO(saved);
    }

    @Transactional
    @CacheEvict(cacheNames = { CacheConfig.BOOKS_BY_ID, CacheConfig.BOOKS_PAGE, CacheConfig.BOOKS_SEARCH }, allEntries = true)
    public BookResponseDTO updateBook(Integer id, BookRequestDTO request) {
        normalizeBookRequest(request);
        validateBookRequest(request);

        Book existingBook = bookRepository.findById(id)
                .filter(book -> !book.isDeleted())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Book not found"));

        Integer previousAvailable = existingBook.getAvailableCopies();

        existingBook.setTitle(request.getTitle());
        existingBook.setIsbn(request.getIsbn());
        existingBook.setPublisher(request.getPublisher());
        existingBook.setTotalCopies(request.getTotalCopies());
        existingBook.setAvailableCopies(request.getAvailableCopies());
        existingBook.setDescription(request.getDescription());

        if (request.getAuthors() != null) {
            existingBook.setAuthors(resolveAuthors(request.getAuthors()));
        }
        if (request.getCategories() != null) {
            existingBook.setCategories(resolveCategories(request.getCategories()));
        }

        Book updated = bookRepository.save(existingBook);
        int before = previousAvailable == null ? 0 : previousAvailable;
        int after = updated.getAvailableCopies() == null ? 0 : updated.getAvailableCopies();
        if (after > before) {
            reservationService.promoteQueueForBook(updated);
        }
        return convertToDTO(updated);
    }

    private void validateBookRequest(BookRequestDTO request) {
        if (request == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Book payload is required");
        }

        if (!hasText(request.getTitle())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Title is required");
        }

        if (!hasText(request.getIsbn())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ISBN is required");
        }

        if (request.getTotalCopies() == null || request.getTotalCopies() < 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Total copies must be at least 1");
        }

        if (request.getAvailableCopies() == null || request.getAvailableCopies() < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Available copies cannot be negative");
        }

        if (request.getAvailableCopies() > request.getTotalCopies()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Available copies cannot exceed total copies");
        }

    }

    /**
     * Defensive normalization so the service doesn't rely on clients to keep copy
     * counts consistent. This also avoids DB check-constraint violations for
     * available_copies <= total_copies.
     */
    private void normalizeBookRequest(BookRequestDTO request) {
        if (request == null) {
            return;
        }

        // Allow clients to send either `author`/`category` (single) or `authors`/`categories` (multi).
        // Also supports comma-separated single-string input.
        request.setAuthors(normalizeNameSet(request.getAuthors(), request.getAuthor()));
        request.setCategories(normalizeNameSet(request.getCategories(), request.getCategory()));

        Integer total = request.getTotalCopies();
        if (total == null) {
            return;
        }

        Integer available = request.getAvailableCopies();
        if (available == null) {
            request.setAvailableCopies(total);
            return;
        }

        if (available > total) {
            request.setAvailableCopies(total);
        }
    }

    private Set<String> normalizeNameSet(Set<String> values, String legacySingle) {
        LinkedHashSet<String> out = new LinkedHashSet<>();

        if (values != null) {
            for (String value : values) {
                if (!hasText(value)) continue;
                String trimmed = value.trim();
                // If someone sends a comma-separated string inside the set, split it.
                if (trimmed.contains(",")) {
                    for (String part : trimmed.split(",")) {
                        if (hasText(part)) out.add(part.trim());
                    }
                } else {
                    out.add(trimmed);
                }
            }
        }

        if (hasText(legacySingle)) {
            String trimmed = legacySingle.trim();
            if (trimmed.contains(",")) {
                for (String part : trimmed.split(",")) {
                    if (hasText(part)) out.add(part.trim());
                }
            } else {
                out.add(trimmed);
            }
        }

        return out.isEmpty() ? Collections.emptySet() : out;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    @CacheEvict(cacheNames = { CacheConfig.BOOKS_BY_ID, CacheConfig.BOOKS_PAGE, CacheConfig.BOOKS_SEARCH }, allEntries = true)
    public void deleteBook(Integer id) {
        Book book = bookRepository.findById(id)
                .filter(existing -> !existing.isDeleted())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Book not found"));

        boolean hasActiveIssue = issueRepository.existsByBookBookIdAndStatusIn(
                id, List.of("issued", "overdue"));
        if (hasActiveIssue) {
            throw new ApiException(HttpStatus.CONFLICT, "Cannot delete book: it is currently issued");
        }

        boolean hasActiveReservation = reservationRepository.existsByBookBookIdAndStatusIn(
                id, List.of("reserved"));
        if (hasActiveReservation) {
            throw new ApiException(HttpStatus.CONFLICT, "Cannot delete book: it has active reservations");
        }

        book.setDeleted(true);
        bookRepository.save(book);
    }

    private BookResponseDTO convertToDTO(Book book) {
        BookResponseDTO dto = new BookResponseDTO();
        dto.setBookId(book.getBookId());
        dto.setTitle(book.getTitle());
        dto.setIsbn(book.getIsbn());
        dto.setPublisher(book.getPublisher());
        dto.setTotalCopies(book.getTotalCopies());
        dto.setAvailableCopies(book.getAvailableCopies());
        dto.setDescription(book.getDescription());
        dto.setAuthors(book.getAuthors().stream()
                .map(Author::getFullName)
                .collect(Collectors.toSet()));
        dto.setCategories(book.getCategories().stream()
                .map(Category::getName)
                .collect(Collectors.toSet()));
        return dto;
    }

    private Set<Author> resolveAuthors(Set<String> authorNames) {
        if (authorNames == null || authorNames.isEmpty()) {
            return Collections.emptySet();
        }
        return authorNames.stream()
                .map(name -> authorRepository.findByFullName(name)
                        .orElseGet(() -> {
                            Author newAuthor = new Author();
                            newAuthor.setFullName(name);
                            return authorRepository.save(newAuthor);
                        }))
                .collect(Collectors.toSet());
    }

    private Set<Category> resolveCategories(Set<String> categoryNames) {
        if (categoryNames == null || categoryNames.isEmpty()) {
            return Collections.emptySet();
        }
        return categoryNames.stream()
                .map(name -> categoryRepository.findByName(name)
                        .orElseGet(() -> {
                            Category newCategory = new Category();
                            newCategory.setName(name);
                            return categoryRepository.save(newCategory);
                        }))
                .collect(Collectors.toSet());
    }
}
