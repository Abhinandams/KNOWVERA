package com.knowvera.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowvera.model.Issue;

public interface IssueRepository extends JpaRepository<Issue, Integer> {

    List<Issue> findByUserFnameAndUserLname(String fname, String lname);  
    List<Issue> findByUserUserId(Integer userId);
    boolean existsByUserUserIdAndBookBookIdAndStatus(
        Integer userId,
        Integer bookId,
        String status);
    boolean existsByUserUserIdAndBookBookIdAndStatusIn(
        Integer userId,
        Integer bookId,
        List<String> statuses);
    boolean existsByBookBookIdAndStatusIn(Integer bookId, List<String> statuses);
    boolean existsByUserUserIdAndStatusIn(Integer userId, List<String> statuses);
    long countByUserUserIdAndStatusIn(Integer userId, List<String> statuses);
}
