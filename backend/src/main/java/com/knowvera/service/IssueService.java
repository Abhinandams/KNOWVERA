package com.knowvera.service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowvera.exception.ApiException;
import com.knowvera.model.Book;
import com.knowvera.model.Issue;
import com.knowvera.model.Reservation;
import com.knowvera.model.User;
import com.knowvera.repository.BookRepository;
import com.knowvera.repository.FineRepository;
import com.knowvera.repository.IssueRepository;
import com.knowvera.repository.ReservationRepository;
import com.knowvera.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IssueService {

    private static final int MAX_ACTIVE_ISSUES_PER_USER = 3;
    private static final BigDecimal MAX_OUTSTANDING_FINE_FOR_ISSUE = BigDecimal.valueOf(150);

    private final IssueRepository issueRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final FineRepository fineRepository;
    private final OverdueFineService overdueFineService;

    @Transactional
public Issue issueBook(Integer userId, Integer bookId) {

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

    Book book = bookRepository.findById(bookId)
            .filter(existing -> !existing.isDeleted())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Book not found"));

    if (!"active".equals(user.getStatus())) {
        throw new ApiException(HttpStatus.FORBIDDEN, "User is not active");
    }

    if (book.getAvailableCopies() <= 0) {
        throw new ApiException(HttpStatus.CONFLICT, "No copies available");
    }

    long activeIssueCount = issueRepository.countByUserUserIdAndStatusIn(
            userId, List.of("issued", "overdue"));
    if (activeIssueCount >= MAX_ACTIVE_ISSUES_PER_USER) {
        throw new ApiException(HttpStatus.BAD_REQUEST, "User cannot have more than 3 active issued books");
    }

    overdueFineService.refreshOverdueForActiveIssues();
    BigDecimal outstandingFineAmount = fineRepository.sumOutstandingFineAmountByUserId(userId);
    if (outstandingFineAmount.compareTo(MAX_OUTSTANDING_FINE_FOR_ISSUE) > 0) {
        throw new ApiException(HttpStatus.FORBIDDEN, "User with outstanding fine greater than 150 cannot issue books");
    }

    Reservation activeReservation = reservationRepository
            .findFirstByUserUserIdAndBookBookIdAndStatusOrderByReservedOnAsc(userId, bookId, "reserved")
            .orElse(null);

    boolean alreadyHasActiveIssue = issueRepository
            .existsByUserUserIdAndBookBookIdAndStatusIn(
                    userId, bookId, List.of("issued", "overdue"));
    boolean alreadyHasActiveReservation = activeReservation != null;

    if (alreadyHasActiveIssue) {
        throw new ApiException(HttpStatus.CONFLICT, "Same book cannot be issued/reserved at the same time by this user");
    }

    if (activeReservation != null) {
        activeReservation.setStatus("collected");
        activeReservation.setExpiryDate(null);
        reservationRepository.save(activeReservation);
    }

    boolean alreadyHeldByReservation = isImmediateHoldReservation(activeReservation);
    if (!alreadyHeldByReservation) {
        book.setAvailableCopies(book.getAvailableCopies() - 1);
    }

    Issue issue = new Issue();
    issue.setUser(user);
    issue.setBook(book);
    LocalDate issueDate = LocalDate.now();
    issue.setIssueDate(issueDate);
    issue.setDueDate(issueDate.plusDays(7));
    issue.setStatus("issued");

    bookRepository.saveAndFlush(book);
    return issueRepository.save(issue);
}
public List<Issue> getAllIssues() {
    overdueFineService.refreshOverdueForActiveIssues();
    return issueRepository.findAll();
}

public List<Issue> getIssuesByUserId(Integer userId) {
    overdueFineService.refreshOverdueForActiveIssues();
    return issueRepository.findByUserUserId(userId);
}

public List<Issue> getIssuesByUserName(String fname, String lname) {
    overdueFineService.refreshOverdueForActiveIssues();
    return issueRepository.findByUserFnameAndUserLname(fname, lname);
}

public Issue getIssueById(Integer issueId) {
    return issueRepository.findById(issueId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Issue not found"));
}


    @Transactional
    public Issue returnBook(Integer issueId) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Issue not found"));

        if ("returned".equals(issue.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "Book already returned");
        }

        overdueFineService.updateFineUntilDate(issue, LocalDate.now());
        issue.setReturnDate(LocalDate.now());
        issue.setStatus("returned");

        Book book = issue.getBook();
        int totalCopies = book.getTotalCopies() == null ? 0 : book.getTotalCopies();
        int currentAvailable = book.getAvailableCopies() == null ? 0 : book.getAvailableCopies();
        // Guard against legacy inconsistent rows where available copies may already be at max.
        int nextAvailable = Math.min(totalCopies, Math.max(0, currentAvailable) + 1);
        book.setAvailableCopies(nextAvailable);

        bookRepository.saveAndFlush(book);
        return issueRepository.save(issue);
    }

    private boolean isImmediateHoldReservation(Reservation reservation) {
        if (reservation == null || reservation.getReservedOn() == null || reservation.getExpiryDate() == null) {
            return false;
        }
        LocalDate expectedImmediateExpiry = reservation.getReservedOn().toLocalDate().plusDays(1);
        return !reservation.getExpiryDate().toLocalDate().isAfter(expectedImmediateExpiry);
    }
}
