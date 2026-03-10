package com.knowvera.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IssueRequestDTO {
    @JsonAlias("user_id")
    private Integer userId;

    @JsonAlias("book_id")
    private Integer bookId;
}
