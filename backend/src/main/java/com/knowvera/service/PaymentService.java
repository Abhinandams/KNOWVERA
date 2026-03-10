package com.knowvera.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.knowvera.dto.PaymentSummaryDTO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowvera.dto.PaymentRequestDTO;
import com.knowvera.exception.ApiException;
import com.knowvera.model.Fine;
import com.knowvera.model.Issue;
import com.knowvera.model.Payment;
import com.knowvera.repository.FineRepository;
import com.knowvera.repository.IssueRepository;
import com.knowvera.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final FineRepository fineRepository;
    private final IssueRepository issueRepository;
    private final OverdueFineService overdueFineService;

    @Transactional(readOnly = true)
    public List<PaymentSummaryDTO> getAllPaymentsForAdmin() {
        return paymentRepository.findAllByOrderByPaymentDateDesc().stream()
                .map(payment -> new PaymentSummaryDTO(
                        payment.getPaymentId(),
                        payment.getFine() != null ? payment.getFine().getFineId() : null,
                        payment.getAmountPaid(),
                        payment.getPaymentMethod(),
                        payment.getPaymentDate()))
                .toList();
    }

    @Transactional
    public Payment payFine(PaymentRequestDTO request) {
        if (request.getAmountPaid() == null || request.getAmountPaid().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Amount must be greater than zero");
        }

        Fine fine = fineRepository.findById(request.getFineId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Fine not found"));

        overdueFineService.updateFineUntilDate(fine.getIssue(), LocalDate.now());
        fine = fineRepository.findById(request.getFineId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Fine not found"));

        BigDecimal remainingAmount = fine.getRemainingFineAmount();
        if (remainingAmount == null || remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(HttpStatus.CONFLICT, "Fine is already fully paid");
        }

        if (request.getAmountPaid().compareTo(remainingAmount) > 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Amount paid cannot exceed pending fine amount");
        }

        if (fine.getTotalFineAmount() == null) {
            fine.setTotalFineAmount(remainingAmount);
        }

        Payment payment = new Payment();
        payment.setFine(fine);
        payment.setAmountPaid(request.getAmountPaid());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentDate(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);

        BigDecimal updatedRemainingAmount = remainingAmount.subtract(request.getAmountPaid());
        fine.setRemainingFineAmount(updatedRemainingAmount);

        if (updatedRemainingAmount.compareTo(BigDecimal.ZERO) == 0) {
            fine.setFineStatus("paid");
            Issue issue = fine.getIssue();
            if (!"returned".equalsIgnoreCase(issue.getStatus())) {
                issue.setStatus("returned");
                if (issue.getReturnDate() == null) {
                    issue.setReturnDate(LocalDate.now());
                }
                issueRepository.save(issue);
            }
        } else {
            fine.setFineStatus("pending");
        }
        fineRepository.save(fine);

        return saved;
    }
}
