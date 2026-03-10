package com.knowvera.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "fine")
@Getter
@Setter
public class Fine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fine_id")
    private Integer fineId;

    @OneToOne
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;

    @Column(name = "total_fine_amount", nullable = false)
    private BigDecimal totalFineAmount;

    @Column(name = "remaining_fine_amount", nullable = false)
    private BigDecimal remainingFineAmount;

    @Column(name = "fine_status")
    private String fineStatus;
}
