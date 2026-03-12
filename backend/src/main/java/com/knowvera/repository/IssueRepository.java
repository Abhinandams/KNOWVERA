package com.knowvera.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("""
            select i from Issue i
            join i.user u
            join i.book b
            where (
              lower(u.fname) like lower(concat('%', :q, '%'))
              or lower(u.lname) like lower(concat('%', :q, '%'))
              or lower(b.title) like lower(concat('%', :q, '%'))
              or str(u.userId) like concat('%', :q, '%')
              or str(b.bookId) like concat('%', :q, '%')
              or str(i.issueId) like concat('%', :q, '%')
            )
            """)
    List<Issue> searchAll(@Param("q") String q);

    @Query("""
            select i from Issue i
            join i.user u
            join i.book b
            where u.userId = :userId
              and (
                lower(b.title) like lower(concat('%', :q, '%'))
                or str(b.bookId) like concat('%', :q, '%')
                or str(i.issueId) like concat('%', :q, '%')
              )
            """)
    List<Issue> searchByUserId(@Param("userId") Integer userId, @Param("q") String q);
}
