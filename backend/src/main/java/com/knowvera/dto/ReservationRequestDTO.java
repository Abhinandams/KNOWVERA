package com.knowvera.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

import lombok.Data;

@Data
public class ReservationRequestDTO {
    @JsonAlias("user_id")
    private Integer userId;

    @JsonAlias("book_id")
    private Integer bookId;
}
