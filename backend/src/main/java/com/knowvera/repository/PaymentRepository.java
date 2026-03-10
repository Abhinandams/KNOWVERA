package com.knowvera.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.knowvera.model.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    @Query("select coalesce(sum(p.amountPaid), 0) from Payment p where p.fine.fineId = :fineId")
    BigDecimal sumAmountPaidByFineId(@Param("fineId") Integer fineId);

    List<Payment> findAllByOrderByPaymentDateDesc();
}
