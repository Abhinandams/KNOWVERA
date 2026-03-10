package com.knowvera.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.knowvera.model.Fine;

public interface FineRepository extends JpaRepository<Fine, Integer> {
    List<Fine> findByIssueUserUserId(Integer userId);
    Optional<Fine> findByIssueIssueId(Integer issueId);

    @Query("""
            select coalesce(sum(f.remainingFineAmount), 0)
            from Fine f
            where f.issue.user.userId = :userId
              and f.remainingFineAmount > 0
            """)
    BigDecimal sumOutstandingFineAmountByUserId(@Param("userId") Integer userId);
}
