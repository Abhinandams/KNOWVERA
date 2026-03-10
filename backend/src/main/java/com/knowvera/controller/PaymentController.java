package com.knowvera.controller;

import java.util.List;

import com.knowvera.dto.PaymentSummaryDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowvera.dto.PaymentRequestDTO;
import com.knowvera.model.Payment;
import com.knowvera.service.PaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("v1")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/admin/payments")
    public ResponseEntity<List<PaymentSummaryDTO>> getAllPaymentsForAdmin() {
        return ResponseEntity.ok(paymentService.getAllPaymentsForAdmin());
    }

    @PostMapping("/payments")
    public ResponseEntity<Payment> payFine(@RequestBody PaymentRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.payFine(request));
    }
}
