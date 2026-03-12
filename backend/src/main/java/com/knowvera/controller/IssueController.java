package com.knowvera.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.knowvera.dto.IssueRequestDTO;
import com.knowvera.model.Issue;
import com.knowvera.security.UserPrincipal;
import com.knowvera.service.IssueService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("v1/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    @GetMapping
    public ResponseEntity<List<Issue>> getAllIssues(
            @RequestParam(required = false) String fname,
            @RequestParam(required = false) String lname,
            @RequestParam(name = "q", required = false) String q,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean hasUserNameFilter = hasText(fname) || hasText(lname);
        boolean hasQueryFilter = hasText(q);

        if (isAdmin(principal)) {
            if (hasUserNameFilter) {
                if (!hasText(fname) || !hasText(lname)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Both fname and lname are required");
                }
                return ResponseEntity.ok(issueService.getIssuesByUserName(fname, lname));
            }
            if (hasQueryFilter) {
                return ResponseEntity.ok(issueService.getAllIssues(q));
            }
            return ResponseEntity.ok(issueService.getAllIssues());
        }

        if (hasUserNameFilter) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can search issues by user name");
        }
        return ResponseEntity.ok(issueService.getIssuesByUserId(principal.getUser().getUserId(), q));
    }

    @PostMapping
    public ResponseEntity<Issue> issueBook(@RequestBody IssueRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                issueService.issueBook(request.getUserId(), request.getBookId()));
    }


    @PutMapping("/{issue_id}")
    public ResponseEntity<Issue> returnBook(
            @PathVariable("issue_id") Integer issueId,
            @AuthenticationPrincipal UserPrincipal principal) {
        Issue issue = issueService.getIssueById(issueId);
        if (!isAdmin(principal) && !issue.getUser().getUserId().equals(principal.getUser().getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can return only your own issued books");
        }

        return ResponseEntity.ok(issueService.returnBook(issueId));
    }

    private boolean isAdmin(UserPrincipal principal) {
        return principal.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
