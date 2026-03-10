package com.knowvera.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponseDTO {
    private String token;
    private String tokenType;
    private Long expiresInSeconds;
    private Integer userId;
    private String role;
    private String email;
}
