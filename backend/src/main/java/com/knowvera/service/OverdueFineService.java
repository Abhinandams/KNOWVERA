package com.knowvera.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowvera.model.Fine;
import com.knowvera.model.Issue;
import com.knowvera.repository.FineRepository;
import com.knowvera.repository.IssueRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OverdueFineService {

    private static final long ISSUE_PERIOD_DAYS = 7;
    private static final BigDecimal DAILY_FINE = BigDecimal.TEN;

    private final IssueRepository issueRepository;
    private final FineRepository fineRepository;

    @Transactional
    @Scheduled(fixedDelayString = "${fine.refresh-ms:8640000}")
    public void refreshOverdueForActiveIssues() {
        List<Issue> issues = issueRepository.findAll();
        LocalDate today = LocalDate.now();

        for (Issue issue : issues) {
            if ("returned".equalsIgnoreCase(issue.getStatus())) {
                // Business rule: returned implies any fine is settled. Ensure invariants hold even if
                // a previous run left remaining amounts due to race/legacy data.
                fineRepository.findByIssueIssueId(issue.getIssueId()).ifPresent(fine -> {
                    if (fine.getRemainingFineAmount() != null && fine.getRemainingFineAmount().compareTo(BigDecimal.ZERO) > 0) {
                        fine.setRemainingFineAmount(BigDecimal.ZERO);
                    }
                    fine.setFineStatus("paid");
                    if (fine.getTotalFineAmount() == null) {
                        fine.setTotalFineAmount(BigDecimal.ZERO);
                    }
                    fineRepository.save(fine);
                });
                continue;
            }

            LocalDate dueDate = resolveDueDate(issue);

            if (today.isAfter(dueDate)) {
                issue.setStatus("overdue");
                upsertFine(issue, today);
            }

            issueRepository.save(issue);
        }
    }

    @Transactional
    public void updateFineUntilDate(Issue issue, LocalDate asOfDate) {
        LocalDate dueDate = resolveDueDate(issue);

        if (asOfDate.isAfter(dueDate)) {
            upsertFine(issue, asOfDate);
        }
    }

    private void upsertFine(Issue issue, LocalDate asOfDate) {
        LocalDate dueDate = resolveDueDate(issue);
        long overdueDays = ChronoUnit.DAYS.between(dueDate, asOfDate);

        if (overdueDays <= 0) {
            return;
        }

        BigDecimal computedTotal = DAILY_FINE.multiply(BigDecimal.valueOf(overdueDays));

        Fine fine = fineRepository.findByIssueIssueId(issue.getIssueId()).orElseGet(() -> {
            Fine newFine = new Fine();
            newFine.setIssue(issue);
            newFine.setTotalFineAmount(BigDecimal.ZERO);
            newFine.setRemainingFineAmount(BigDecimal.ZERO);
            newFine.setFineStatus("pending");
            return newFine;
        });

        BigDecimal currentTotal = fine.getTotalFineAmount() == null ? BigDecimal.ZERO : fine.getTotalFineAmount();
        BigDecimal currentRemaining = fine.getRemainingFineAmount() == null ? BigDecimal.ZERO : fine.getRemainingFineAmount();

        BigDecimal delta = computedTotal.subtract(currentTotal);
        if (delta.compareTo(BigDecimal.ZERO) > 0) {
            fine.setRemainingFineAmount(currentRemaining.add(delta));
            fine.setTotalFineAmount(computedTotal);
        } else if (fine.getTotalFineAmount() == null) {
            fine.setTotalFineAmount(computedTotal);
        }

        if (fine.getRemainingFineAmount().compareTo(BigDecimal.ZERO) <= 0) {
            fine.setFineStatus("paid");
        } else {
            fine.setFineStatus("pending");
        }

        fineRepository.save(fine);
    }

    private LocalDate resolveDueDate(Issue issue) {
        if (issue.getDueDate() != null) {
            return issue.getDueDate();
        }
        LocalDate computed = issue.getIssueDate().plusDays(ISSUE_PERIOD_DAYS);
        issue.setDueDate(computed);
        return computed;
    }
}
