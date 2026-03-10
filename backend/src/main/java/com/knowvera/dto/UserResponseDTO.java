package com.knowvera.dto;

import lombok.Data;

@Data
public class UserResponseDTO {

    private Integer userId;
    private String fname;
    private String lname;
    private String email;
    private String phone;
    private String address;
    private String role;
    private String status;
    private String profileImage;
}
