package com.knowvera.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonAlias;

import lombok.Data;

@Data
public class PaymentRequestDTO {
    @JsonAlias("fine_id")
    private Integer fineId;

    @JsonAlias({"amount_paid", "amount"})
    private BigDecimal amountPaid;

    @JsonAlias("payment_method")
    private String paymentMethod;
}
