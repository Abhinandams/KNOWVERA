package com.knowvera.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PaymentSummaryDTO {
    private Integer paymentId;
    private Integer fineId;
    private BigDecimal amountPaid;
    private String paymentMethod;
    private LocalDateTime paymentDate;
}
