package com.knowvera.dto;

import java.time.Instant;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ErrorResponseDTO {
    private Instant timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
}
